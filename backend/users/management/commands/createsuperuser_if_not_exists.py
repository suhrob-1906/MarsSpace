from django.core.management.base import BaseCommand
from users.models import User
import os

class Command(BaseCommand):
    help = 'Создает суперпользователя, если он еще не существует.'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'superadmin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'SuperAdmin2024!@#')

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username, email, password)
            self.stdout.write(self.style.SUCCESS(f'Суперпользователь {username} создан успешно.'))
        else:
            self.stdout.write(self.style.WARNING(f'Суперпользователь {username} уже существует.'))