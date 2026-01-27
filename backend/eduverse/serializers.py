from rest_framework import serializers
from .models import EduverseCategory, EduverseVideo, BlogPost, Homework, HomeworkSubmission

class EduverseVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EduverseVideo
        fields = '__all__'

class EduverseCategorySerializer(serializers.ModelSerializer):
    videos = EduverseVideoSerializer(many=True, read_only=True)
    
    class Meta:
        model = EduverseCategory
        fields = ['id', 'title', 'slug', 'videos']

class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    
    class Meta:
        model = BlogPost
        fields = ['id', 'author_name', 'post_type', 'content', 'like_count', 'created_at']

class HomeworkSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='course_category.title', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    submissions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Homework
        fields = [
            'id', 'title', 'description', 'course_category', 'category_name',
            'due_date', 'max_points', 'created_by', 'created_by_name',
            'created_at', 'is_active', 'submissions_count'
        ]
        read_only_fields = ['created_by', 'created_at']
    
    def get_submissions_count(self, obj):
        return obj.submissions.count()

class HomeworkSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    homework_title = serializers.CharField(source='homework.title', read_only=True)
    graded_by_name = serializers.CharField(source='graded_by.get_full_name', read_only=True)
    
    class Meta:
        model = HomeworkSubmission
        fields = [
            'id', 'homework', 'homework_title', 'student', 'student_name',
            'content', 'file_url', 'points_earned', 'submitted_at',
            'graded_at', 'graded_by', 'graded_by_name', 'feedback'
        ]
        read_only_fields = ['student', 'submitted_at', 'graded_at', 'graded_by']
