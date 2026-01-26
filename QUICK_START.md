# 🚀 Быстрый старт MarsSpace

## ⚡ За 5 минут

### 1. Backend (Терминал 1)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# или source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_db
python manage.py runserver
```

✅ Backend запущен на `http://127.0.0.1:8000`

### 2. Frontend (Терминал 2)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend запущен на `http://localhost:5173`

### 3. Вход

Откройте `http://localhost:5173` в браузере

**Супер Админ (только для вас):**
- Username: `superadmin`
- Password: `SuperAdmin2024!@#`

**Тестовые аккаунты:**
- Admin: `admin` / `admin123`
- Student: `student1` / `student123`
- Teacher: `teacher1` / `teacher123`

## ⚠️ Если видите ошибку подключения

**Ошибка:** `ERR_CONNECTION_REFUSED` или `Network Error`

**Решение:**
1. Убедитесь, что backend запущен (проверьте терминал 1)
2. Откройте `http://127.0.0.1:8000` в браузере - должна быть страница Django
3. Если не работает, проверьте, что порт 8000 свободен

## 📝 Что дальше?

После входа вы можете:
- 👨‍🎓 **Как студент**: Проходить курсы, играть в typing game, покупать товары
- 👑 **Как админ**: Управлять всем через Admin Panel

Подробная документация в [README.md](README.md)
