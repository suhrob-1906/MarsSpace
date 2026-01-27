from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        STUDENT = 'STUDENT', 'Student'

    class Language(models.TextChoices):
        RU = 'ru', 'Russian'
        UZ = 'uz', 'Uzbek'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    language = models.CharField(max_length=2, choices=Language.choices, default=Language.RU)
    
    # Gamification fields
    coins = models.IntegerField(default=0, help_text="Virtual currency for shop purchases")
    points = models.IntegerField(default=0, help_text="Points earned from competitions and activities")
    activity_days = models.IntegerField(default=0, help_text="Consecutive days of activity")
    
    # Premium subscription
    has_premium = models.BooleanField(default=False, help_text="Premium subscription status")
    premium_expires_at = models.DateTimeField(null=True, blank=True, help_text="Premium expiration date")
    
    # Profile customization
    avatar_url = models.CharField(max_length=500, blank=True, help_text="User avatar image URL")
    last_activity_date = models.DateField(auto_now=True, help_text="Last activity date for streak tracking")
    
    # created_at is date_joined in AbstractUser
    # is_active is already in AbstractUser
    # first_name, last_name are in AbstractUser

    # Relationships
    teaching_groups = models.ManyToManyField('StudyGroup', related_name='teachers', blank=True)
    learning_groups = models.ManyToManyField('StudyGroup', related_name='students', blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class StudyGroup(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Attendance(models.Model):
    """Track student attendance in study groups"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    is_present = models.BooleanField(default=False)
    marked_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='marked_attendance')
    marked_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, help_text="Optional notes about attendance")
    
    class Meta:
        ordering = ['-date']
        unique_together = ['student', 'group', 'date']
    
    def __str__(self):
        status = "Present" if self.is_present else "Absent"
        return f"{self.student.username} - {self.group.name} - {self.date} ({status})"
