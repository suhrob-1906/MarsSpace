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
