from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EduverseCategoryViewSet, EduverseVideoViewSet, BlogPostViewSet,
    HomeworkViewSet, HomeworkSubmissionViewSet
)

router = DefaultRouter()
router.register(r'eduverse/categories', EduverseCategoryViewSet)
router.register(r'eduverse/videos', EduverseVideoViewSet)
router.register(r'blog/posts', BlogPostViewSet)
router.register(r'homework', HomeworkViewSet)
router.register(r'homework-submissions', HomeworkSubmissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
