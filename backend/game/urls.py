from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SeasonViewSet, TypingAttemptViewSet, LeaderboardView

router = DefaultRouter()
router.register(r'seasons', SeasonViewSet)
router.register(r'typing', TypingAttemptViewSet, basename='typing')

urlpatterns = [
    path('', include(router.urls)),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]
