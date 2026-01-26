from rest_framework import viewsets, permissions, views
from rest_framework.response import Response
from django.db import transaction
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
        
        # Calculate coins reward based on WPM and accuracy
        wpm = serializer.validated_data.get('wpm', 0)
        accuracy = serializer.validated_data.get('accuracy', 0)
        
        # Base coins: 1 coin per 10 WPM, multiplied by accuracy percentage
        # Minimum 1 coin if accuracy > 50%, otherwise 0
        coins_reward = 0
        if accuracy >= 50:
            coins_reward = max(1, int((wpm / 10) * (accuracy / 100)))
        
        # Bonus for high performance
        if wpm >= 60 and accuracy >= 90:
            coins_reward += 5  # Bonus for excellent performance
        elif wpm >= 40 and accuracy >= 80:
            coins_reward += 2  # Bonus for good performance
        
        # Energy gain: 5-15 based on performance
        energy_gain = max(5, min(15, int(wpm / 5)))
        
        with transaction.atomic():
            serializer.save(
                student=student, 
                season=season,
                energy_gain=energy_gain
            )
            
            # Update wallet with coins and energy
            wallet, _ = Wallet.objects.get_or_create(student=student)
            wallet.coins += coins_reward
            wallet.energy += energy_gain
            wallet.save()
            
            # Store coins_reward in the instance for response
            serializer.instance.coins_reward = coins_reward

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
