from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from game.models import Season
from users.models import User
from django.db.models import Sum


class Command(BaseCommand):
    help = 'Check and rotate typing seasons (1 day duration)'

    def handle(self, *args, **options):
        now = timezone.now()
        today = now.date()
        
        # Check for active season
        active_season = Season.objects.filter(is_active=True).first()
        
        if active_season:
            # Check if season has ended
            if today > active_season.end_date:
                self.stdout.write(f'Season "{active_season.title}" has ended. Distributing rewards...')
                
                # Import here to avoid circular imports
                from game.models import TypingAttempt
                
                # Get top 3 players
                top_players = (
                    TypingAttempt.objects
                    .filter(season=active_season)
                    .values('student')
                    .annotate(total_score=Sum('score'))
                    .order_by('-total_score')[:3]
                )
                
                rewards = active_season.rewards_json or {"1": 50, "2": 30, "3": 20}
                
                for idx, player_data in enumerate(top_players, 1):
                    try:
                        student = User.objects.get(id=player_data['student'])
                        coins_reward = int(rewards.get(str(idx), 0))
                        
                        student.coins += coins_reward
                        student.save()
                        
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'  Rank {idx}: {student.username} - {player_data["total_score"]:.2f} points - Awarded {coins_reward} coins'
                            )
                        )
                    except User.DoesNotExist:
                        continue
                
                # Mark season as completed
                active_season.is_active = False
                active_season.is_completed = True
                active_season.save()
                
                self.stdout.write(self.style.SUCCESS(f'Season "{active_season.title}" completed!'))
                
                # Create new season
                self.create_new_season(today)
            else:
                self.stdout.write(f'Season "{active_season.title}" is still active until {active_season.end_date}')
        else:
            # No active season, create one
            self.stdout.write('No active season found. Creating new season...')
            self.create_new_season(today)
    
    def create_new_season(self, start_date):
        """Create a new 1-day typing season"""
        end_date = start_date + timedelta(days=1)
        
        # Create season title with date
        title = f"Daily Challenge {start_date.strftime('%Y-%m-%d')}"
        
        season = Season.objects.create(
            title=title,
            start_date=start_date,
            end_date=end_date,
            rewards_json={"1": 50, "2": 30, "3": 20},  # Coins for top 3
            is_active=True,
            is_completed=False
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Created new season: "{title}" ({start_date} to {end_date})'
            )
        )
        
        return season
