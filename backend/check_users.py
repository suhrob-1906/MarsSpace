"""
Скрипт для проверки и создания пользователей в базе данных
"""
import os
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import User

def check_and_create_users():
    """Проверить и создать тестовых пользователей"""
    
    users_to_create = [
        {
            'username': 'admin',
            'password': 'admin123',
            'role': 'ADMIN',
            'first_name': 'Admin',
            'last_name': 'User',
            'email': 'admin@marsspace.com',
            'is_staff': True,
            'is_superuser': True,
        },
        {
            'username': 'teacher',
            'password': 'teacher123',
            'role': 'TEACHER',
            'first_name': 'Teacher',
            'last_name': 'User',
            'email': 'teacher@marsspace.com',
        },
        {
            'username': 'student',
            'password': 'student123',
            'role': 'STUDENT',
            'first_name': 'Student',
            'last_name': 'User',
            'email': 'student@marsspace.com',
            'coins': 100,
            'points': 50,
        },
    ]
    
    for user_data in users_to_create:
        username = user_data['username']
        password = user_data.pop('password')
        
        # Проверяем, существует ли пользователь
        user, created = User.objects.get_or_create(
            username=username,
            defaults=user_data
        )
        
        if created:
            user.set_password(password)
            user.save()
            print(f"✅ Создан пользователь: {username}")
        else:
            # Обновляем пароль для существующего пользователя
            user.set_password(password)
            for key, value in user_data.items():
                setattr(user, key, value)
            user.save()
            print(f"🔄 Обновлен пользователь: {username}")
        
        # Проверяем пароль
        from django.contrib.auth import authenticate
        auth_user = authenticate(username=username, password=password)
        if auth_user:
            print(f"   ✓ Пароль работает для {username}")
        else:
            print(f"   ✗ ОШИБКА: Пароль не работает для {username}")

if __name__ == '__main__':
    print("=" * 50)
    print("Проверка и создание пользователей")
    print("=" * 50)
    check_and_create_users()
    print("=" * 50)
    print("Готово!")
