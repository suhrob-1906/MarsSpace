from rest_framework import serializers
from .models import Course, Lesson, Progress, HomeworkSubmission

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'course', 'index', 'title', 'theory_text', 'practice_text', 'lesson_type', 'is_active']

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
    course_title = serializers.ReadOnlyField(source='lesson.course.title')
    student_username = serializers.ReadOnlyField(source='student.username')
    student_name = serializers.SerializerMethodField()
    reviewed_by_username = serializers.ReadOnlyField(source='reviewed_by.username', allow_null=True)
    
    class Meta:
        model = HomeworkSubmission
        fields = ['id', 'lesson', 'lesson_title', 'course_title', 'student', 'student_username', 'student_name', 
                  'file', 'status', 'teacher_comment', 'coins_reward', 'reviewed_by', 'reviewed_by_username',
                  'reviewed_at', 'created_at']
        read_only_fields = ['status', 'teacher_comment', 'reviewed_by', 'reviewed_at', 'created_at']
    
    def get_student_name(self, obj):
        if obj.student.first_name or obj.student.last_name:
            return f"{obj.student.first_name} {obj.student.last_name}".strip()
        return obj.student.username

class AdminHomeworkSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for admin to manage all submissions"""
    lesson_title = serializers.ReadOnlyField(source='lesson.title')
    course_title = serializers.ReadOnlyField(source='lesson.course.title')
    student_username = serializers.ReadOnlyField(source='student.username')
    student_name = serializers.SerializerMethodField()
    reviewed_by_username = serializers.ReadOnlyField(source='reviewed_by.username', allow_null=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = HomeworkSubmission
        fields = ['id', 'lesson', 'lesson_title', 'course_title', 'student', 'student_username', 'student_name',
                  'file', 'file_url', 'status', 'teacher_comment', 'coins_reward', 'reviewed_by', 'reviewed_by_username',
                  'reviewed_at', 'created_at']
    
    def get_student_name(self, obj):
        if obj.student.first_name or obj.student.last_name:
            return f"{obj.student.first_name} {obj.student.last_name}".strip()
        return obj.student.username
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
