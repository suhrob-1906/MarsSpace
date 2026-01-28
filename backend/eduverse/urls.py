from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EduverseCategoryViewSet, EduverseVideoViewSet, BlogPostViewSet,
    HomeworkViewSet, HomeworkSubmissionViewSet,
    AdminEduverseCategoryViewSet, AdminEduverseVideoViewSet,
    AdminHomeworkViewSet
)

router = DefaultRouter()
router.register(r'eduverse/categories', EduverseCategoryViewSet, basename='eduverse-category')
router.register(r'eduverse/videos', EduverseVideoViewSet, basename='eduverse-video')
router.register(r'blog/posts', BlogPostViewSet, basename='blog-post')
router.register(r'homework', HomeworkViewSet, basename='homework')
router.register(r'homework-submissions', HomeworkSubmissionViewSet, basename='homework-submission')

# Admin routes
router.register(r'admin/eduverse/categories', AdminEduverseCategoryViewSet, basename='admin-eduverse-category')
router.register(r'admin/eduverse/videos', AdminEduverseVideoViewSet, basename='admin-eduverse-video')
router.register(r'admin/eduverse/homework', AdminHomeworkViewSet, basename='admin-homework')

urlpatterns = [
    path('', include(router.urls)),
]

