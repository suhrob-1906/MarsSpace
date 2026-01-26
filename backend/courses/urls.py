from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, LessonViewSet, ProgressViewSet, 
    HomeworkSubmissionViewSet, AdminHomeworkSubmissionViewSet,
    AdminCourseViewSet, AdminLessonViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'my-progress', ProgressViewSet, basename='my-progress')
router.register(r'homework', HomeworkSubmissionViewSet, basename='homework')
router.register(r'admin/courses', AdminCourseViewSet, basename='admin-courses')
router.register(r'admin/lessons', AdminLessonViewSet, basename='admin-lessons')
router.register(r'admin/homework', AdminHomeworkSubmissionViewSet, basename='admin-homework')

urlpatterns = [
    path('', include(router.urls)),
]
