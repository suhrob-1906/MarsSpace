from django.contrib import admin
from .models import User, StudyGroup, Attendance

admin.site.register(User)
admin.site.register(StudyGroup)
admin.site.register(Attendance)
