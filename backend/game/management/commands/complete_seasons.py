from django.core.management.base import BaseCommand
from django.utils import timezone
from game.models import Season, TypingAttempt, Wallet
from users.models import User
from django.db.models import Sum
from datetime import timedelta

class Command(BaseCommand):
    help = 'Complete expired seasons, distribute rewards, and create new ones'

    def handle(self, *args, **options):
        now = timezone.now()
        
        # Find active seasons that have ended
        expired_seasons = Season.objects.filter(
            is_active=True,
            end_date__lt=now.date()
        )

        if not expired_seasons.exists():
            self.stdout.write(self.style.SUCCESS('No expired seasons found.'))
            
            # Check if we need a new season (if no active season exists)
            active_season = Season.objects.filter(is_active=True).first()
            if not active_season:
                self.create_new_season()
            return

        for season in expired_seasons:
            self.stdout.write(f'Processing season: {season.title}')
            
            # 1. Distribute rewards to top 3 players
            top_players = (
                TypingAttempt.objects
                .filter(season=season)
                .values('student')
                .annotate(total_score=Sum('score'))
                .order_by('-total_score')[:3]
            )

            rewards = season.rewards_json or {"1": 300, "2": 200, "3": 100}
            
            for idx, player_data in enumerate(top_players, 1):
                try:
                    student = User.objects.get(id=player_data['student'])
                    points_reward = int(rewards.get(str(idx), 0))
                    
                    # Add points/coins
                    student.coins += points_reward
                    student.points += points_reward # Add to lifetime points too
                    student.save()
                    
                    self.stdout.write(f'  Awarded {points_reward} coins to {student.username} (Rank {idx})')
                except User.DoesNotExist:
                    continue

            # 2. Mark as completed
            season.is_active = False
            season.is_completed = True
            season.save()
            self.stdout.write(self.style.SUCCESS(f'Season "{season.title}" completed.'))

        # 3. Create new season
        self.create_new_season()

    def create_new_season(self):
        last_season = Season.objects.order_by('-id').first()
        new_season_number = 1
        
        if last_season:
            # Extract number from "Season 1" or similar if possible, else increment ID logic
            try:
                new_season_number = int(last_season.title.split()[-1]) + 1
            except (ValueError, IndexError):
                new_season_number = last_season.id + 1
        
        start_date = timezone.now().date()
        end_date = start_date + timedelta(weeks=2)
        
        new_season = Season.objects.create(
            title=f"Season {new_season_number}",
            start_date=start_date,
            end_date=end_date,
            rewards_json={"1": 300, "2": 200, "3": 100},
            is_active=True
        )
        self.stdout.write(self.style.SUCCESS(f'Created new season: "{new_season.title}" (Ends: {end_date})'))
