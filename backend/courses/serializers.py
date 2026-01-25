from rest_framework import serializers
from .models import Course, Lesson, Progress, HomeworkSubmission

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'index', 'title', 'theory_text', 'practice_text', 'lesson_type', 'is_active']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'order', 'is_active']

class CourseDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'order', 'lessons']

class ProgressSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    
    class Meta:
        model = Progress
        fields = ['id', 'course', 'course_title', 'current_lesson_index', 'completed_lessons_count']

class HomeworkSubmissionSerializer(serializers.ModelSerializer):
    lesson_title = serializers.ReadOnlyField(source='lesson.title')
    
    class Meta:
        model = HomeworkSubmission
        fields = ['id', 'lesson', 'lesson_title', 'file', 'status', 'teacher_comment', 'created_at']
        read_only_fields = ['status', 'teacher_comment', 'created_at']
