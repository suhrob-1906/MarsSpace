from django.db import models
from django.conf import settings

class EduverseCategory(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.title

class EduverseVideo(models.Model):
    category = models.ForeignKey(EduverseCategory, related_name='videos', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    banner_url = models.CharField(max_length=500, blank=True)
    video_url = models.CharField(max_length=500)
    
    def __str__(self):
        return self.title

class BlogPost(models.Model):
    class Type(models.TextChoices):
        ACHIEVEMENT = 'ACHIEVEMENT', 'Achievement'
        TEXT = 'TEXT', 'Text'

    author = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='posts', on_delete=models.CASCADE)
    post_type = models.CharField(max_length=20, choices=Type.choices, default=Type.TEXT)
    content = models.TextField()
    like_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author} - {self.post_type}"

class Homework(models.Model):
    """Homework assignments created by teachers/admins"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    course_category = models.ForeignKey(EduverseCategory, on_delete=models.CASCADE, related_name='homework')
    due_date = models.DateTimeField()
    max_points = models.IntegerField(default=100, help_text="Maximum points for this homework")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_homework')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Current Task"
        verbose_name_plural = "Current Tasks"
    
    def __str__(self):
        return f"{self.title} - {self.course_category.title}"

class HomeworkSubmission(models.Model):
    """Student homework submissions"""
    homework = models.ForeignKey(Homework, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='homework_submissions')
    content = models.TextField(help_text="Student's answer or solution")
    file_url = models.CharField(max_length=500, blank=True, help_text="Optional file attachment URL")
    points_earned = models.IntegerField(default=0, help_text="Points awarded by teacher")
    submitted_at = models.DateTimeField(auto_now_add=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='graded_submissions')
    feedback = models.TextField(blank=True, help_text="Teacher's feedback")
    
    class Meta:
        ordering = ['-submitted_at']
        unique_together = ['homework', 'student']
    
    def __str__(self):
        return f"{self.student.username} - {self.homework.title}"
