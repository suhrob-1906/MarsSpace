from rest_framework import serializers
from .models import User, StudyGroup, Attendance

class UserSerializer(serializers.ModelSerializer):
    last_wpm = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'language', 'coins', 'points', 'activity_days',
            'has_premium', 'premium_expires_at', 'avatar_url', 
            'last_activity_date', 'date_joined', 'last_wpm'
        ]
        read_only_fields = ['coins', 'points', 'activity_days', 'has_premium', 'premium_expires_at', 'last_wpm']

    def get_last_wpm(self, obj):
        last_attempt = obj.typing_attempts.order_by('-created_at').first()
        return last_attempt.wpm if last_attempt else 0


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar_url']


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management with password handling"""
    password = serializers.CharField(write_only=True, required=False)
    last_wpm = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'language', 'coins', 'points', 'activity_days',
            'has_premium', 'premium_expires_at', 'avatar_url',
            'last_activity_date', 'date_joined', 'is_active', 'password', 'last_wpm'
        ]
        read_only_fields = ['date_joined', 'last_wpm']
    
    def get_last_wpm(self, obj):
        last_attempt = obj.typing_attempts.order_by('-created_at').first()
        return last_attempt.wpm if last_attempt else 0
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class StudyGroupSerializer(serializers.ModelSerializer):
    students_count = serializers.SerializerMethodField()
    teachers_count = serializers.SerializerMethodField()
    students = SimpleUserSerializer(many=True, read_only=True)
    teacher_details = SimpleUserSerializer(source='teacher', read_only=True)
    
    class Meta:
        model = StudyGroup
        fields = [
            'id', 'name', 'description', 'is_active', 
            'days_of_week', 'start_time', 'end_time',
            'students_count', 'teachers_count', 'students',
            'teacher', 'teacher_details'
        ]
    
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
