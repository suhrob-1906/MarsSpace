from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta, datetime
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
                    {'error': 'AI service is not configured. Please contact administrator.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Configure and call Gemini with 1.5-flash model (most optimal)
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Add context for educational assistant
            context = f"""You are a helpful programming tutor for MarsSpace educational platform. 
You help students learn programming concepts in a clear and friendly way.
Student question: {message}"""
            
            response = model.generate_content(context)
            
            return Response({
                'reply': response.text,
                'timestamp': timezone.now()
            })
            
        except Exception as e:
            # Log the error for debugging
            print(f"AI Chat Error: {str(e)}")
            return Response(
                {'error': 'AI service is temporarily unavailable. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TeacherStatsViewSet(viewsets.ViewSet):
    """Dashboard statistics for teachers"""
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        if request.user.role != 'TEACHER':
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        # Get teacher's groups
        groups = StudyGroup.objects.filter(teachers=request.user) | StudyGroup.objects.filter(teacher=request.user)
        groups = groups.distinct()
        
        # Calculate total students - only count students with STUDENT role
        total_students = User.objects.filter(learning_groups__in=groups, role='STUDENT').distinct().count()
        
        # Find next lesson
        now = timezone.now()
        current_weekday = now.weekday()  # 0=Monday, 6=Sunday
        current_time = now.time()
        
        next_lesson = None
        min_seconds_until = None
        
        for group in groups.filter(is_active=True):
            if not group.days_of_week or not group.start_time:
                continue
            
            # Handle both JSON array and comma-separated string formats
            try:
                if isinstance(group.days_of_week, list):
                    lesson_days = [int(d) for d in group.days_of_week]
                else:
                    lesson_days = [int(d.strip()) for d in str(group.days_of_week).split(',')]
            except:
                continue
            
            # Find next lesson day for this group
            for day in lesson_days:
                # Calculate days until this lesson
                days_until = (day - current_weekday) % 7
                
                # If lesson is today
                if days_until == 0:
                    # Check if it hasn't started yet
                    if current_time < group.start_time:
                        # Calculate seconds until lesson starts
                        lesson_datetime = datetime.combine(now.date(), group.start_time)
                        now_datetime = datetime.combine(now.date(), current_time)
                        seconds_until = int((lesson_datetime - now_datetime).total_seconds())
                    else:
                        # Lesson already passed today, check next week
                        seconds_until = days_until * 86400 + 7 * 86400
                        seconds_until += int((datetime.combine(now.date(), group.start_time) - datetime.combine(now.date(), current_time)).total_seconds())
                else:
                    # Lesson is in future days
                    seconds_until = days_until * 86400
                    # Add time difference
                    lesson_datetime = datetime.combine(now.date(), group.start_time)
                    now_datetime = datetime.combine(now.date(), current_time)
                    seconds_until += int((lesson_datetime - now_datetime).total_seconds())
                
                # Update next_lesson if this is sooner
                if min_seconds_until is None or seconds_until < min_seconds_until:
                    min_seconds_until = seconds_until
                    next_lesson = {
                        'group_name': group.name,
                        'weekday': day,
                        'day_name': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day],
                        'start_time': group.start_time.strftime('%H:%M'),
                        'end_time': group.end_time.strftime('%H:%M') if group.end_time else None,
                        'seconds_until': seconds_until
                    }
        
        return Response({
            'total_students': total_students,
            'active_groups': groups.filter(is_active=True).count(),
            'next_lesson': next_lesson
        })

class AttendanceViewSet(viewsets.ModelViewSet):
    """Manage student attendance"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """Allow teachers and admins to create/update attendance"""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'mark_attendance', 'mark_bulk']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
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
            return queryset.filter(group__in=StudyGroup.objects.filter(teachers=user) | StudyGroup.objects.filter(teacher=user))
        
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
                {'error': 'Attendance can only be marked during class time (15 mins before start until end)'},
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

        try:
            group = StudyGroup.objects.get(id=group_id)
        except StudyGroup.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

        # Validate time (skip if admin)
        current_date_str = timezone.now().strftime('%Y-%m-%d')
        if not request.user.is_staff:
             if date != current_date_str:
                 return Response(
                     {'error': 'Teachers can only mark attendance for today'},
                     status=status.HTTP_400_BAD_REQUEST
                 )
             if not group.can_mark_attendance_now():
                 return Response(
                     {'error': 'Attendance can only be marked during class time'},
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

class TeacherAwardCoinsView(APIView):
    """Allow teachers to award coins to students"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        if request.user.role != 'TEACHER':
            return Response(
                {'error': 'Only teachers can award coins'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        student_id = request.data.get('student_id')
        amount = request.data.get('amount')
        group_id = request.data.get('group_id')
        
        if not all([student_id, amount, group_id]):
            return Response(
                {'error': 'student_id, amount, and group_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = int(amount)
            if amount <= 0:
                return Response(
                    {'error': 'Amount must be positive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify teacher has access to this group
        try:
            group = StudyGroup.objects.get(id=group_id)
            if group.teacher != request.user and request.user not in group.teachers.all():
                return Response(
                    {'error': 'You do not have access to this group'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except StudyGroup.DoesNotExist:
            return Response(
                {'error': 'Group not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify student exists and is in the group
        try:
            student = User.objects.get(id=student_id)
            if group not in student.learning_groups.all():
                return Response(
                    {'error': 'Student is not in this group'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Award coins
        student.coins += amount
        student.save()
        
        return Response({
            'message': f'Successfully awarded {amount} coins to {student.username}',
            'student_coins': student.coins
        })
