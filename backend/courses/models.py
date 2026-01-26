from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from .validators import validate_zip_file

def validate_file_size(value):
    filesize = value.size
    if filesize > 10 * 1024 * 1024:  # 10MB limit
        raise ValidationError("The maximum file size that can be uploaded is 10MB")


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Lesson(models.Model):
    class Type(models.TextChoices):
        NORMAL = 'NORMAL', 'Normal'
        EXAM = 'EXAM', 'Exam'

    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    index = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    theory_text = models.TextField(blank=True)
    practice_text = models.TextField(blank=True)
    lesson_type = models.CharField(max_length=10, choices=Type.choices, default=Type.NORMAL)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['index']
        unique_together = ['course', 'index']

    def __str__(self):
        return f"{self.course.title} - {self.index}. {self.title}"

class Progress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='progress', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    current_lesson_index = models.PositiveIntegerField(default=1)
    completed_lessons_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.student.username} - {self.course.title} ({self.current_lesson_index})"

class HomeworkSubmission(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = 'SUBMITTED', 'Submitted'
        VIEWED = 'VIEWED', 'Viewed'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='submissions', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    file = models.FileField(
        upload_to='homework_uploads/',
        validators=[
            FileExtensionValidator(allowed_extensions=['zip']),  # Only ZIP files as per requirements
            validate_file_size,
            validate_zip_file  # Additional validation to ensure it's a valid ZIP
        ]
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    teacher_comment = models.TextField(blank=True)
    coins_reward = models.PositiveIntegerField(default=0, help_text="Coins awarded when accepted")
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reviewed_submissions', null=True, blank=True, on_delete=models.SET_NULL)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.lesson} - {self.status}"
