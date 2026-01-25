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
