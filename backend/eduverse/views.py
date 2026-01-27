from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import EduverseCategory, EduverseVideo, BlogPost, Homework, HomeworkSubmission
from .serializers import (
    EduverseCategorySerializer, EduverseVideoSerializer, 
    BlogPostSerializer, HomeworkSerializer, HomeworkSubmissionSerializer
)

class EduverseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EduverseCategory.objects.all()
    serializer_class = EduverseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

class EduverseVideoViewSet(viewsets.ModelViewSet):
    queryset = EduverseVideo.objects.all()
    serializer_class = EduverseVideoSerializer
    permission_classes = [permissions.IsAdminUser]

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all().order_by('-created_at')
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        post.like_count += 1
        post.save()
        return Response({'like_count': post.like_count})

class HomeworkViewSet(viewsets.ModelViewSet):
    """Homework management - teachers/admins create, students view"""
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin sees all
        if user.role == 'ADMIN':
            return Homework.objects.all()
        
        # Teacher sees their created homework
        if user.role == 'TEACHER':
            return Homework.objects.filter(created_by=user)
        
        # Students see active homework
        return Homework.objects.filter(is_active=True)
    
    def perform_create(self, serializer):
        # Auto-set created_by to current user
        serializer.save(created_by=self.request.user)

class HomeworkSubmissionViewSet(viewsets.ModelViewSet):
    """Student homework submissions"""
    queryset = HomeworkSubmission.objects.all()
    serializer_class = HomeworkSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin sees all
        if user.role == 'ADMIN':
            return HomeworkSubmission.objects.all()
        
        # Teacher sees submissions for their homework
        if user.role == 'TEACHER':
            return HomeworkSubmission.objects.filter(homework__created_by=user)
        
        # Students see only their own submissions
        return HomeworkSubmission.objects.filter(student=user)
    
    def perform_create(self, serializer):
        # Auto-set student to current user
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def grade(self, request, pk=None):
        """Grade a homework submission (teachers/admins only)"""
        submission = self.get_object()
        user = request.user
        
        # Only teachers/admins can grade
        if user.role not in ['TEACHER', 'ADMIN']:
            return Response(
                {'error': 'Only teachers and admins can grade submissions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Teachers can only grade their own homework
        if user.role == 'TEACHER' and submission.homework.created_by != user:
            return Response(
                {'error': 'You can only grade submissions for your own homework'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        points_earned = request.data.get('points_earned')
        feedback = request.data.get('feedback', '')
        
        if points_earned is None:
            return Response(
                {'error': 'points_earned is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate points
        if points_earned > submission.homework.max_points:
            return Response(
                {'error': f'Points cannot exceed maximum of {submission.homework.max_points}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update submission
        submission.points_earned = points_earned
        submission.feedback = feedback
        submission.graded_at = timezone.now()
        submission.graded_by = user
        submission.save()
        
        # Award points to student
        student = submission.student
        student.points += points_earned
        student.save()
        
        return Response({
            'message': 'Homework graded successfully',
            'points_earned': points_earned,
            'student_total_points': student.points
        })
