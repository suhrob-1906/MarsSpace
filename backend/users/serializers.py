from rest_framework import serializers
from .models import User, StudyGroup, Attendance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'language', 'coins', 'points', 'activity_days',
            'has_premium', 'premium_expires_at', 'avatar_url', 
            'last_activity_date', 'date_joined'
        ]
        read_only_fields = ['coins', 'points', 'activity_days', 'has_premium', 'premium_expires_at']


class StudyGroupSerializer(serializers.ModelSerializer):
    students_count = serializers.SerializerMethodField()
    teachers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyGroup
        fields = ['id', 'name', 'description', 'is_active', 'students_count', 'teachers_count']
    
    def get_students_count(self, obj):
        return obj.students.count()
    
    def get_teachers_count(self, obj):
        return obj.teachers.count()

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.get_full_name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'group', 'group_name',
            'date', 'is_present', 'marked_by', 'marked_by_name',
            'marked_at', 'notes'
        ]
        read_only_fields = ['marked_by', 'marked_at']
