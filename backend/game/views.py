from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.db.models import Sum, Max, Count
from django.utils import timezone
from .models import Season, TypingAttempt
from .serializers import SeasonSerializer, TypingAttemptSerializer
from users.models import User

class SeasonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Season.objects.filter(is_active=True)
    serializer_class = SeasonSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def end_season(self, request, pk=None):
        """End season and distribute rewards to top 3 players"""
        season = self.get_object()
        
        if not season.is_active:
            return Response(
                {'error': 'Season is already ended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get top 3 players by total score
        top_players = (
            TypingAttempt.objects
            .filter(season=season)
            .values('student')
            .annotate(total_score=Sum('score'))
            .order_by('-total_score')[:3]
        )
        
        rewards = season.rewards_json or {"1": 300, "2": 150, "3": 75}
        awarded = []
        
        for idx, player_data in enumerate(top_players, 1):
            student = User.objects.get(id=player_data['student'])
            points_reward = int(rewards.get(str(idx), 0))
            
            student.points += points_reward
            student.save()
            
            awarded.append({
                'rank': idx,
                'username': student.username,
                'total_score': player_data['total_score'],
                'points_awarded': points_reward
            })
        
        # Mark season as inactive
        season.is_active = False
        season.save()
        
        return Response({
            'message': f'Season "{season.title}" ended successfully',
            'rewards_distributed': awarded
        })

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
        coins_reward = 0
        if accuracy >= 50:
            coins_reward = max(1, int((wpm / 10) * (accuracy / 100)))
        
        # Bonus for high performance
        if wpm >= 60 and accuracy >= 90:
            coins_reward += 5  # Excellent performance
        elif wpm >= 40 and accuracy >= 80:
            coins_reward += 2  # Good performance
        
        with transaction.atomic():
            serializer.save(
                student=student, 
                season=season
            )
            
            # Update user coins and last_wpm
            student.coins += coins_reward
            student.last_wpm = wpm
            student.save()
            
            # Store for response
            serializer.instance.coins_reward = coins_reward

class LeaderboardView(views.APIView):
    """Get current season leaderboard with top players"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        season = Season.objects.filter(is_active=True).first()
        if not season:
            return Response({
                'season': None,
                'leaderboard': [],
                'message': 'No active season'
            })
        
        # Get top 10 players by total score in current season
        top_players = (
            TypingAttempt.objects
            .filter(season=season)
            .values('student__id', 'student__username', 'student__avatar_url')
            .annotate(
                total_score=Sum('score'),
                attempts_count=Count('id'),
                best_wpm=Max('wpm')
            )
            .order_by('-total_score')[:10]
        )
        
        leaderboard = []
        for idx, player in enumerate(top_players, 1):
            # Calculate potential reward
            reward = 0
            if idx == 1:
                reward = int(season.rewards_json.get("1", 300))
            elif idx == 2:
                reward = int(season.rewards_json.get("2", 150))
            elif idx == 3:
                reward = int(season.rewards_json.get("3", 75))
            
            leaderboard.append({
                'rank': idx,
                'user_id': player['student__id'],
                'username': player['student__username'],
                'avatar_url': player['student__avatar_url'],
                'total_score': round(player['total_score'], 2),
                'attempts_count': player['attempts_count'],
                'best_wpm': round(player['best_wpm'], 2),
                'potential_reward': reward
            })
        
        # Check if current user is in top 10
        current_user_rank = None
        for entry in leaderboard:
            if entry['user_id'] == request.user.id:
                current_user_rank = entry['rank']
                break
        
        return Response({
            'season': {
                'id': season.id,
                'title': season.title,
                'start_date': season.start_date,
                'end_date': season.end_date,
                'rewards': season.rewards_json,
                'time_remaining': season.time_remaining()
            },
            'leaderboard': leaderboard,
            'current_user_rank': current_user_rank
        })

