from rest_framework import serializers
from .models import User, StudyGroup, Attendance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'language', 'coins', 'points', 'activity_days',
            'has_premium', 'premium_expires_at', 'avatar_url', 
            'last_activity_date', 'date_joined', 'last_wpm'
        ]
        read_only_fields = ['coins', 'points', 'activity_days', 'has_premium', 'premium_expires_at', 'last_wpm']


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar_url']


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management with password handling"""
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'language', 'coins', 'points', 'activity_days',
            'has_premium', 'premium_expires_at', 'avatar_url',
            'last_activity_date', 'date_joined', 'is_active', 'password', 'last_wpm'
        ]
        read_only_fields = ['date_joined', 'last_wpm']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        
        if not password:
            raise serializers.ValidationError({'password': 'Password is required when creating a user'})
        
        user = User(**validated_data)
        user.set_password(password)
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
    student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of student IDs to assign to this group"
    )
    
    class Meta:
        model = StudyGroup
        fields = [
            'id', 'name', 'description', 'is_active', 
            'days_of_week', 'start_time', 'end_time',
            'students_count', 'teachers_count', 'students',
            'teacher', 'teacher_details', 'student_ids'
        ]
    
    def get_students_count(self, obj):
        return obj.students.count()
    
    def get_teachers_count(self, obj):
        return obj.teachers.count()
    
    def create(self, validated_data):
        student_ids = validated_data.pop('student_ids', [])
        group = StudyGroup.objects.create(**validated_data)
        
        if student_ids:
            students = User.objects.filter(id__in=student_ids, role='STUDENT')
            group.students.set(students)
        
        return group
    
    def update(self, instance, validated_data):
        student_ids = validated_data.pop('student_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if student_ids is not None:
            students = User.objects.filter(id__in=student_ids, role='STUDENT')
            instance.students.set(students)
        
        return instance

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
