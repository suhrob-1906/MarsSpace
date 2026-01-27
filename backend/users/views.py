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

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update user profile (language, etc.)"""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAdminUser]

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
        
        # Admin sees all
        if user.role == 'ADMIN':
            return Attendance.objects.all()
        
        # Teacher sees their groups
        if user.role == 'TEACHER':
            return Attendance.objects.filter(group__in=user.teaching_groups.all())
        
        # Student sees their own
        return Attendance.objects.filter(student=user)
    
    def perform_create(self, serializer):
        # Auto-set marked_by to current user
        serializer.save(marked_by=self.request.user)
    
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
