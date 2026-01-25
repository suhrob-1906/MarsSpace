from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, LessonViewSet, ProgressViewSet, HomeworkSubmissionViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'my-progress', ProgressViewSet, basename='my-progress')
router.register(r'homework', HomeworkSubmissionViewSet, basename='homework')

urlpatterns = [
    path('', include(router.urls)),
]
