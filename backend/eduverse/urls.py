from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EduverseCategoryViewSet, BlogPostViewSet

router = DefaultRouter()
router.register(r'eduverse/categories', EduverseCategoryViewSet)
router.register(r'blog/posts', BlogPostViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
