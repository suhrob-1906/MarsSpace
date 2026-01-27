# 🔧 Решение проблемы с входом (401 Unauthorized)

## Проблема
При попытке входа на сайт появляется ошибка:
```
Failed to load resource: the server responded with a status of 401 ()
```

## Причины
1. Неверные учетные данные в базе данных
2. Пароли не были правильно хешированы
3. Пользователи не созданы на production

## ✅ Решение

### Шаг 1: Запустить скрипт проверки пользователей

**Локально:**
```bash
cd backend
python check_users.py
```

Этот скрипт:
- Проверит существующих пользователей
- Создаст/обновит пользователей с правильными паролями
- Проверит, что пароли работают

### Шаг 2: Для Production (Render)

1. Зайдите в Render Dashboard
2. Выберите ваш backend сервис
3. Перейдите в **Shell**
4. Выполните:
```bash
python manage.py shell
```

5. Вставьте этот код:
```python
from users.models import User

# Создать/обновить админа
admin, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'role': 'ADMIN',
        'first_name': 'Admin',
        'last_name': 'User',
        'email': 'admin@marsspace.com',
        'is_staff': True,
        'is_superuser': True,
    }
)
admin.set_password('admin123')
admin.save()
print(f"Admin: {'created' if created else 'updated'}")

# Создать/обновить учителя
teacher, created = User.objects.get_or_create(
    username='teacher',
    defaults={
        'role': 'TEACHER',
        'first_name': 'Teacher',
        'last_name': 'User',
        'email': 'teacher@marsspace.com',
    }
)
teacher.set_password('teacher123')
teacher.save()
print(f"Teacher: {'created' if created else 'updated'}")

# Создать/обновить студента
student, created = User.objects.get_or_create(
    username='student',
    defaults={
        'role': 'STUDENT',
        'first_name': 'Student',
        'last_name': 'User',
        'email': 'student@marsspace.com',
        'coins': 100,
        'points': 50,
    }
)
student.set_password('student123')
student.save()
print(f"Student: {'created' if created else 'updated'}")

print("✅ Все пользователи обновлены!")
```

6. Нажмите Enter
7. Выйдите из shell: `exit()`

### Шаг 3: Проверка

Попробуйте войти с учетными данными:

**Админ:**
- Логин: `admin`
- Пароль: `admin123`

**Учитель:**
- Логин: `teacher`
- Пароль: `teacher123`

**Студент:**
- Логин: `student`
- Пароль: `student123`

---

## 🔍 Дополнительная диагностика

### Проверить логи Render
1. Render Dashboard → Ваш сервис → Logs
2. Ищите строки с ошибками аутентификации

### Проверить через API напрямую

```bash
curl -X POST https://marsspace-backend.onrender.com/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Ожидаемый ответ:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Если ошибка 401:**
- Пользователь не существует
- Пароль неверный
- Проблема с базой данных

---

## 🆘 Если проблема остается

### Вариант 1: Создать суперпользователя через Django

В Render Shell:
```bash
python manage.py createsuperuser
```

Введите:
- Username: `admin`
- Email: `admin@marsspace.com`
- Password: `admin123`
- Password (again): `admin123`

### Вариант 2: Сбросить базу данных

⚠️ **ВНИМАНИЕ: Это удалит все данные!**

В Render Shell:
```bash
python manage.py flush --no-input
python manage.py migrate
python manage.py seed_db
```

### Вариант 3: Проверить настройки JWT

В `backend/config/settings.py` должно быть:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

---

## 📝 Проверочный чеклист

- [ ] Запустил `check_users.py` локально
- [ ] Выполнил код в Render Shell
- [ ] Проверил логи Render на ошибки
- [ ] Попробовал войти через frontend
- [ ] Проверил через curl/Postman
- [ ] Пароли работают локально
- [ ] Пароли работают на production

---

## ✅ После исправления

1. Очистите кэш браузера (Ctrl+Shift+Delete)
2. Обновите страницу (F5)
3. Попробуйте войти снова

**Должно работать!** 🎉
