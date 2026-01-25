from rest_framework import serializers
from .models import EduverseCategory, EduverseVideo, BlogPost

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
