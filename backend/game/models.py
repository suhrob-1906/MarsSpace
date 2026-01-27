from django.db import models
from django.conf import settings
from django.utils import timezone
import datetime

class Season(models.Model):
    title = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    rewards_json = models.JSONField(default=dict) # { "1": 300, "2": 200 ... }
    is_active = models.BooleanField(default=True)
    is_completed = models.BooleanField(default=False)

    def time_remaining(self):
        """Returns seconds until season ends"""
        now = timezone.now()
        end_datetime = timezone.make_aware(datetime.datetime.combine(self.end_date, datetime.time.max))
        
        if now > end_datetime:
            return 0
        
        delta = end_datetime - now
        return int(delta.total_seconds())

    def __str__(self):
        return self.title

class TypingAttempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='typing_attempts', on_delete=models.CASCADE)
    season = models.ForeignKey(Season, blank=True, null=True, on_delete=models.SET_NULL)
    wpm = models.FloatField()
    accuracy = models.FloatField()
    score = models.FloatField(default=0)
    energy_gain = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # basic score calc if not set
        if not self.score:
            self.score = round(self.wpm * (self.accuracy / 100), 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.username} - {self.score}"

class Wallet(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='wallet', on_delete=models.CASCADE)
    coins = models.IntegerField(default=0)
    energy = models.IntegerField(default=100)
    streak = models.IntegerField(default=0)
    last_active_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username}: {self.coins} coins"
