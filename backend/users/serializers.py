from rest_framework import serializers
from .models import User, StudyGroup
from game.models import Wallet

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['coins', 'energy', 'streak', 'last_active_date']

class UserSerializer(serializers.ModelSerializer):
    wallet = WalletSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'language', 'wallet']
        read_only_fields = ['role', 'wallet']

class StudyGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGroup
        fields = '__all__'
