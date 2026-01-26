from rest_framework import serializers
from .models import Season, TypingAttempt, Wallet

class SeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = '__all__'

class TypingAttemptSerializer(serializers.ModelSerializer):
    coins_reward = serializers.IntegerField(read_only=True, default=0)
    
    class Meta:
        model = TypingAttempt
        fields = ['id', 'wpm', 'accuracy', 'score', 'energy_gain', 'coins_reward', 'created_at']
        read_only_fields = ['score', 'energy_gain', 'coins_reward', 'created_at']

class LeaderboardEntrySerializer(serializers.Serializer):
    username = serializers.CharField()
    total_score = serializers.FloatField()
