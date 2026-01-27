from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MeView, UserViewSet, StudyGroupViewSet,
    SubscriptionPurchaseView, SubscriptionStatusView,
    AIChatView, AttendanceViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', StudyGroupViewSet)
router.register(r'attendance', AttendanceViewSet)

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('subscription/purchase/', SubscriptionPurchaseView.as_view(), name='subscription-purchase'),
    path('subscription/status/', SubscriptionStatusView.as_view(), name='subscription-status'),
    path('ai-chat/', AIChatView.as_view(), name='ai-chat'),
    path('', include(router.urls)),
]
