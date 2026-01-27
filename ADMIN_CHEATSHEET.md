# 🎯 Быстрая шпаргалка для администратора

## 🔐 Вход в систему

### Локально
- **Admin панель**: http://localhost:8000/admin/
- **Логин**: `admin`
- **Пароль**: `admin123`

### Production
- **Admin панель**: https://marsspace-backend.onrender.com/admin/
- **Логин**: `admin`
- **Пароль**: `admin123`

---

## ⚡ Быстрые действия

### Добавить коины пользователю
1. `/admin/` → **Users**
2. Найти пользователя → Открыть
3. **Coins** = 500 (или нужное количество)
4. **Save**

### Активировать премиум
1. `/admin/` → **Users** → Открыть пользователя
2. ✅ **Has premium**
3. **Premium expires at** = дата через 30 дней
4. **Save**

### Создать домашнее задание
1. `/admin/` → **Homeworks** → **Add Homework+**
2. **Title** = "Урок 1: Основы Python"
3. **Course category** = выбрать
4. **Max points** = 100
5. **Due date** = срок сдачи
6. **Save**

### Оценить работу студента
1. `/admin/` → **Homework submissions**
2. Открыть работу студента
3. **Points earned** = 85 (из 100)
4. **Feedback** = "Отличная работа!"
5. **Save** ← Очки автоматически добавятся студенту!

### Создать группу
1. `/admin/` → **Study groups** → **Add Study Group+**
2. **Name** = "Python Beginners 2024"
3. **Is active** = ✅
4. **Save**

### Добавить студентов в группу
1. Открыть группу
2. **Students** → выбрать из списка
3. **Save**

### Отметить посещаемость
1. `/admin/` → **Attendances** → **Add Attendance+**
2. **Student** = выбрать
3. **Group** = выбрать
4. **Date** = сегодня
5. **Is present** = ✅
6. **Save**

---

## 📊 Полезные фильтры

### Найти премиум пользователей
`/admin/users/` → Фильтр справа: **Has premium = Yes**

### Найти активных студентов
`/admin/users/` → Фильтр: **Activity days > 0**

### Посмотреть непроверенные работы
`/admin/eduverse/homeworksubmission/` → Фильтр: **Graded at = Empty**

---

## 🎮 Управление сезонами

### Создать новый сезон
1. `/admin/` → **Seasons** → **Add Season+**
2. **Title** = "Season 2: Evolution"
3. **Start date** = дата начала
4. **End date** = дата окончания
5. **Rewards json** = `{"1": 300, "2": 150, "3": 75}`
6. **Is active** = ✅ (только один активный!)
7. **Save**

### Завершить сезон (через API)
```bash
POST /api/v1/game/seasons/{id}/end_season/
```
Автоматически начислит награды топ-3 игрокам!

---

## 🛍️ Магазин

### Добавить товар
1. `/admin/` → **Shop items** → **Add Shop Item+**
2. **Name** = "Премиум курс Python"
3. **Price** = 200 (коинов)
4. **Is available** = ✅
5. **Save**

---

## 📚 Курсы

### Добавить категорию
1. `/admin/` → **Eduverse categories** → **Add+**
2. **Title** = "Python для начинающих"
3. **Slug** = "python-beginners"
4. **Save**

### Добавить видео
1. `/admin/` → **Eduverse videos** → **Add+**
2. **Category** = выбрать
3. **Title** = "Урок 1: Переменные"
4. **Video url** = ссылка на YouTube
5. **Order** = 1
6. **Save**

---

## 🔧 Django Shell команды

### Дать всем студентам 100 коинов
```python
python manage.py shell

from users.models import User
from django.db.models import F

User.objects.filter(role='STUDENT').update(coins=F('coins') + 100)
```

### Найти топ-10 по очкам
```python
from users.models import User

top_users = User.objects.filter(role='STUDENT').order_by('-points')[:10]
for user in top_users:
    print(f"{user.username}: {user.points} очков")
```

### Активировать премиум всем с 1000+ очками
```python
from users.models import User
from datetime import datetime, timedelta

User.objects.filter(
    role='STUDENT', 
    points__gte=1000
).update(
    has_premium=True,
    premium_expires_at=datetime.now() + timedelta(days=30)
)
```

---

## 📱 Основные URL

### Backend
- Admin: `/admin/`
- API Docs: `/api/v1/`
- Users: `/api/v1/users/`
- Homework: `/api/v1/homework/`
- Leaderboard: `/api/v1/game/leaderboard/`

### Frontend
- Dashboard: `/dashboard`
- Courses: `/courses`
- Typing Game: `/typing`
- Shop: `/shop`
- Blog: `/blog`

---

## 🆘 Быстрая помощь

### Сбросить пароль
`/admin/users/` → Открыть пользователя → **Change password**

### Удалить пользователя
`/admin/users/` → Выбрать → **Action: Delete** → **Go**

### Экспорт данных
`/admin/` → Любая таблица → Выбрать записи → **Action: Export**

---

## 📞 Контакты

- **GitHub**: https://github.com/suhrob-1906/MarsSpace
- **Backend**: https://marsspace-backend.onrender.com
- **Frontend**: https://marsspace.vercel.app

**Полное руководство**: См. `ADMIN_GUIDE.md`
