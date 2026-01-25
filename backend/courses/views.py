from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, Lesson, Progress, HomeworkSubmission
from .serializers import (
    CourseSerializer, CourseDetailSerializer, LessonSerializer,
    ProgressSerializer, HomeworkSubmissionSerializer
)

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer

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
