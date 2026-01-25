from rest_framework import viewsets, permissions, views
from rest_framework.response import Response
from .models import Season, TypingAttempt, Wallet
from .serializers import SeasonSerializer, TypingAttemptSerializer
from users.models import User
from django.db.models import Sum

class SeasonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Season.objects.filter(is_active=True)
    serializer_class = SeasonSerializer

class TypingAttemptViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TypingAttemptSerializer

    def get_queryset(self):
        return TypingAttempt.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        student = self.request.user
        season = Season.objects.filter(is_active=True).first()
        serializer.save(student=student, season=season)
        
        # Update wallet
        wallet, _ = Wallet.objects.get_or_create(student=student)
        wallet.energy += serializer.instance.energy_gain
        wallet.save()

class LeaderboardView(views.APIView):
    def get(self, request):
        season = Season.objects.filter(is_active=True).first()
        if not season:
            return Response([])
        
        # Simplified leaderboard: Sum of scores for current season
        top_users = TypingAttempt.objects.filter(season=season).values('student__username').annotate(total_score=Sum('score')).order_by('-total_score')[:10]
        
        data = [
            {'username': entry['student__username'], 'total_score': entry['total_score']}
            for entry in top_users
        ]
        return Response(data)
