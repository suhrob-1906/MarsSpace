from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from .models import Course, Lesson, Progress, HomeworkSubmission
from .serializers import (
    CourseSerializer, CourseDetailSerializer, LessonSerializer,
    ProgressSerializer, HomeworkSubmissionSerializer, AdminHomeworkSubmissionSerializer
)
from game.models import Wallet

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer


class AdminCourseViewSet(viewsets.ModelViewSet):
    """ViewSet for admins to manage courses"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Course.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer


class AdminLessonViewSet(viewsets.ModelViewSet):
    """ViewSet for admins to manage lessons"""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = LessonSerializer
    queryset = Lesson.objects.all()

class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lesson.objects.filter(is_active=True)
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProgressViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProgressSerializer

    def get_queryset(self):
        return Progress.objects.filter(student=self.request.user)

    @action(detail=False, methods=['post'], url_path='complete-lesson')
    def complete_lesson(self, request):
        lesson_id = request.data.get('lesson_id')
        if not lesson_id:
            return Response({'detail': 'Lesson ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'detail': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)

        course = lesson.course
        progress, created = Progress.objects.get_or_create(student=request.user, course=course)

        # Check if the lesson is the next logical one to complete
        # Or if it's already completed (idempotency)
        if lesson.index == progress.current_lesson_index:
            progress.current_lesson_index += 1
            progress.completed_lessons_count += 1
            progress.save()
            return Response(self.get_serializer(progress).data, status=status.HTTP_200_OK)
        elif lesson.index < progress.current_lesson_index:
            # Lesson already completed
            return Response({'detail': 'Lesson already completed'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Please complete previous lessons first'}, status=status.HTTP_400_BAD_REQUEST)

class HomeworkSubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HomeworkSubmissionSerializer

    def get_queryset(self):
        return HomeworkSubmission.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class AdminHomeworkSubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for admins to manage all homework submissions"""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminHomeworkSubmissionSerializer
    queryset = HomeworkSubmission.objects.all().select_related('student', 'lesson', 'lesson__course', 'reviewed_by').order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_submission(self, request, pk=None):
        """Accept homework submission and award coins"""
        submission = self.get_object()
        coins_reward = request.data.get('coins_reward', submission.coins_reward or 0)
        comment = request.data.get('teacher_comment', '')

        if submission.status == HomeworkSubmission.Status.ACCEPTED:
            return Response({'detail': 'Submission already accepted'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            submission.status = HomeworkSubmission.Status.ACCEPTED
            submission.coins_reward = coins_reward
            submission.teacher_comment = comment
            submission.reviewed_by = request.user
            submission.reviewed_at = timezone.now()
            submission.save()

            # Award coins to student
            if coins_reward > 0:
                wallet, _ = Wallet.objects.get_or_create(student=submission.student)
                wallet.coins += coins_reward
                wallet.save()

        return Response(self.get_serializer(submission).data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_submission(self, request, pk=None):
        """Reject homework submission"""
        submission = self.get_object()
        comment = request.data.get('teacher_comment', '')

        if submission.status == HomeworkSubmission.Status.REJECTED:
            return Response({'detail': 'Submission already rejected'}, status=status.HTTP_400_BAD_REQUEST)

        submission.status = HomeworkSubmission.Status.REJECTED
        submission.teacher_comment = comment
        submission.reviewed_by = request.user
        submission.reviewed_at = timezone.now()
        submission.save()

        return Response(self.get_serializer(submission).data)

    @action(detail=True, methods=['post'], url_path='update-coins')
    def update_coins_reward(self, request, pk=None):
        """Update coins reward for a submission (before accepting)"""
        submission = self.get_object()
        coins_reward = request.data.get('coins_reward', 0)

        try:
            coins_reward = int(coins_reward)
            if coins_reward < 0:
                return Response({'detail': 'Coins reward must be non-negative'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'detail': 'Invalid coins_reward value'}, status=status.HTTP_400_BAD_REQUEST)

        submission.coins_reward = coins_reward
        submission.save()

        return Response(self.get_serializer(submission).data)
