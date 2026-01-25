from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeView, UserViewSet, StudyGroupViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', StudyGroupViewSet)

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('', include(router.urls)),
]
