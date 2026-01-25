from django.test import TestCase
from users.models import User
from game.models import TypingAttempt, Season, Wallet
from django.utils import timezone
from datetime import timedelta

class TypingAttemptModelTest(TestCase):
    def test_score_calculation(self):
        """Tests that 'score' is calculated correctly on save."""
        user = User.objects.create_user(username='teststudent', password='password')
        attempt = TypingAttempt.objects.create(
            student=user,
            wpm=80,
            accuracy=95.0
        )
        # Expected: 80 * 0.95 = 76.0
        self.assertEqual(attempt.score, 76.0)

    def test_score_is_not_recalculated(self):
        """Tests that an existing score is not recalculated."""
        user = User.objects.create_user(username='teststudent2', password='password')
        attempt = TypingAttempt.objects.create(
            student=user,
            wpm=80,
            accuracy=95.0,
            score=100.0  # Pre-set score
        )
        self.assertEqual(attempt.score, 100.0)


class SeasonModelTest(TestCase):
    def test_season_creation(self):
        start = timezone.now().date()
        end = start + timedelta(days=30)
        season = Season.objects.create(title='Season 1', start_date=start, end_date=end, rewards_json={'1': 100, '2': 50})
        self.assertEqual(season.title, 'Season 1')
        self.assertEqual(season.start_date, start)
        self.assertEqual(season.end_date, end)
        self.assertEqual(season.rewards_json, {'1': 100, '2': 50})
        self.assertTrue(season.is_active)

    def test_season_str_representation(self):
        start = timezone.now().date()
        end = start + timedelta(days=30)
        season = Season.objects.create(title='Test Season', start_date=start, end_date=end)
        self.assertEqual(str(season), 'Test Season')


class WalletModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='walletuser', password='password')

    def test_wallet_creation(self):
        wallet = Wallet.objects.create(student=self.user, coins=100, energy=50, streak=5)
        self.assertEqual(wallet.student, self.user)
        self.assertEqual(wallet.coins, 100)
        self.assertEqual(wallet.energy, 50)
        self.assertEqual(wallet.streak, 5)
        self.assertIsNotNone(wallet.last_active_date)

    def test_wallet_default_values(self):
        wallet = Wallet.objects.create(student=self.user)
        self.assertEqual(wallet.coins, 0)
        self.assertEqual(wallet.energy, 100)
        self.assertEqual(wallet.streak, 0)
        self.assertEqual(wallet.last_active_date, timezone.now().date()) # auto_now_add=True sets it to creation date

    def test_wallet_one_to_one_relation(self):
        wallet = Wallet.objects.create(student=self.user)
        self.assertEqual(self.user.wallet, wallet)

    def test_wallet_str_representation(self):
        wallet = Wallet.objects.create(student=self.user, coins=250)
        self.assertEqual(str(wallet), f"{self.user.username}: 250 coins")
