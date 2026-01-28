from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MeView, UserViewSet, StudyGroupViewSet,
    SubscriptionPurchaseView, SubscriptionStatusView,
    AIChatView, AttendanceViewSet, AdminStatsViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'groups', StudyGroupViewSet, basename='studygroup')
router.register(r'study_groups', StudyGroupViewSet, basename='studygroup_alias') # Alias to fix frontend 404
router.register(r'stats', AdminStatsViewSet, basename='admin_stats')
router.register(r'attendance', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('subscription/purchase/', SubscriptionPurchaseView.as_view(), name='subscription-purchase'),
    path('subscription/status/', SubscriptionStatusView.as_view(), name='subscription-status'),
    path('ai-chat/', AIChatView.as_view(), name='ai-chat'),
    path('', include(router.urls)),
]
