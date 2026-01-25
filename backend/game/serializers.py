from rest_framework import serializers
from .models import Season, TypingAttempt, Wallet

class SeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = '__all__'

class TypingAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypingAttempt
        fields = ['id', 'wpm', 'accuracy', 'score', 'energy_gain', 'created_at']
        read_only_fields = ['score', 'energy_gain', 'created_at']

class LeaderboardEntrySerializer(serializers.Serializer):
    username = serializers.CharField()
    total_score = serializers.FloatField()
