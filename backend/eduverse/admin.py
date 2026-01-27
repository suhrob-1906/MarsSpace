from django.contrib import admin
from .models import EduverseCategory, EduverseVideo, BlogPost, Homework, HomeworkSubmission

admin.site.register(EduverseCategory)
admin.site.register(EduverseVideo)
admin.site.register(BlogPost)
admin.site.register(Homework)
admin.site.register(HomeworkSubmission)
