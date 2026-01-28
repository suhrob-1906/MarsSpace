from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .models import User, StudyGroup, Attendance
from .serializers import UserSerializer, StudyGroupSerializer, AttendanceSerializer
import os
from courses.models import Course

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        # Update activity streak
        if user.last_activity_date != today:
            if user.last_activity_date == today - timedelta(days=1):
                user.activity_days += 1
            else:
                user.activity_days = 1
            user.last_activity_date = today
            user.save()
            
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update user profile (language, etc.)"""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    """Admin viewset for managing all users"""
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        from .serializers import AdminUserSerializer
        return AdminUserSerializer
    
    @action(detail=True, methods=['post'], url_path='change-role')
    def change_role(self, request, pk=None):
        """Change user role"""
        user = self.get_object()
        new_role = request.data.get('role')
        
        if new_role not in dict(User.Role.choices):
            return Response(
                {'error': f'Invalid role. Must be one of: {", ".join(dict(User.Role.choices).keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.role = new_role
        user.save()
        
        return Response({
            'message': f'User role changed to {new_role}',
            'user': self.get_serializer(user).data
        })

class StudyGroupViewSet(viewsets.ModelViewSet):
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = StudyGroup.objects.select_related('teacher').prefetch_related('students', 'teachers')
        
        if user.role == 'ADMIN':
            return queryset
        if user.role == 'TEACHER':
            return queryset.filter(teachers=user) | queryset.filter(teacher=user)
        return queryset.filter(students=user)

class AdminStatsViewSet(viewsets.ViewSet):
    """Dashboard statistics for admin"""
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        return Response({
            "users_count": User.objects.count(),
            "courses_count": Course.objects.count(),
            "groups_count": StudyGroup.objects.count()
        })

class SubscriptionPurchaseView(APIView):
    """Purchase premium subscription for 100 coins"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Check if already has active premium
        if user.has_premium and user.premium_expires_at and user.premium_expires_at > timezone.now():
            return Response(
                {'error': 'You already have an active premium subscription'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has enough coins
        if user.coins < 100:
            return Response(
                {'error': f'Insufficient coins. You have {user.coins} coins, need 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Deduct coins and activate premium
        user.coins -= 100
        user.has_premium = True
        user.premium_expires_at = timezone.now() + timedelta(days=30)  # 30 days premium
        user.save()
        
        return Response({
            'message': 'Premium subscription activated successfully!',
            'coins_remaining': user.coins,
            'premium_expires_at': user.premium_expires_at
        })

class SubscriptionStatusView(APIView):
    """Check current subscription status"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        is_active = user.has_premium and (
            user.premium_expires_at is None or user.premium_expires_at > timezone.now()
        )
        
        return Response({
            'has_premium': is_active,
            'expires_at': user.premium_expires_at,
            'coins': user.coins
        })

class AIChatView(APIView):
    """AI Chat integration with Gemini API"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        message = request.data.get('message', '').strip()
        
        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Import Gemini API
            import google.generativeai as genai
            
            # Get API key from environment
            api_key = os.environ.get('GEMINI_API_KEY')
            if not api_key:
                return Response(
                    {'error': 'AI service is not configured'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Configure and call Gemini
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            
            # Add context for educational assistant
            context = f"You are a helpful programming tutor. Student question: {message}"
            response = model.generate_content(context)
            
            return Response({
                'reply': response.text,
                'timestamp': timezone.now()
            })
            
        except Exception as e:
            return Response(
                {'error': f'AI service error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AttendanceViewSet(viewsets.ModelViewSet):
    """Manage student attendance"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Attendance.objects.all()
        
        # Filter by params
        group_id = self.request.query_params.get('group_id')
        date = self.request.query_params.get('date')
        
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        if date:
            queryset = queryset.filter(date=date)
            
        # Role based filtering
        if user.role == 'ADMIN':
            return queryset
        
        if user.role == 'TEACHER':
            return queryset.filter(group__in=user.teaching_groups.all())
        
        return queryset.filter(student=user)
    
    def perform_create(self, serializer):
        # Auto-set marked_by to current user
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_attendance(self, request):
        """Mark attendance for a single student with time validation"""
        group_id = request.data.get('group_id')
        student_id = request.data.get('student_id')
        is_present = request.data.get('is_present')
        
        try:
            group = StudyGroup.objects.get(id=group_id)
        except StudyGroup.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Validate time (skip if admin)
        if not request.user.is_staff and not group.can_mark_attendance_now():
            return Response(
                {'error': 'Attendance can only be marked during class time'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or update attendance
        attendance, created = Attendance.objects.update_or_create(
            student_id=student_id,
            group=group,
            date=timezone.now().date(),
            defaults={
                'is_present': is_present,
                'marked_by': request.user
            }
        )
        
        return Response({'success': True})
    
    @action(detail=False, methods=['post'])
    def mark_bulk(self, request):
        """Mark attendance for multiple students at once"""
        group_id = request.data.get('group_id')
        date = request.data.get('date')
        student_ids = request.data.get('student_ids', [])
        is_present = request.data.get('is_present', True)
        
        if not all([group_id, date, student_ids]):
            return Response(
                {'error': 'group_id, date, and student_ids are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_count = 0
        for student_id in student_ids:
            Attendance.objects.update_or_create(
                student_id=student_id,
                group_id=group_id,
                date=date,
                defaults={
                    'is_present': is_present,
                    'marked_by': request.user
                }
            )
            created_count += 1
        
        return Response({
            'message': f'Attendance marked for {created_count} students',
            'count': created_count
        })
