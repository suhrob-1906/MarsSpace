# 🚀 Render Deployment Guide - MarsSpace

## 📋 Пошаговая инструкция для деплоя

### 1️⃣ Подготовка Backend на Render

#### Создание Web Service

1. Зайдите на [Render.com](https://render.com)
2. Нажмите **"New +"** → **"Web Service"**
3. Подключите GitHub репозиторий: `https://github.com/suhrob-1906/MarsSpace`

#### Настройки сервиса

```yaml
Name: marsspace-backend
Region: Frankfurt (EU Central)
Branch: main
Root Directory: backend
Runtime: Python 3
```

#### Build Command
```bash
chmod +x deploy_render.sh && ./deploy_render.sh
```

#### Start Command
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

---

### 2️⃣ Environment Variables (Переменные окружения)

Скопируйте эти переменные в Render Dashboard → Environment:

```env
# Django Core
SECRET_KEY=8bd127795ec0e1a9d9681918e04e50a0
DEBUG=False
ALLOWED_HOSTS=*.onrender.com,mars-space-59ri.vercel.app

# Database (PostgreSQL от Render)
DATABASE_URL=postgresql://marsspace_db_user:wDPtA8hFj5qTLu7zaDaU60VRNvPKIOUq@dpg-d5r0n5hr0fns73drljeg-a/marsspace_db

# CORS Settings
CORS_ALLOWED_ORIGINS=https://mars-space-59ri.vercel.app
CSRF_TRUSTED_ORIGINS=https://mars-space-59ri.vercel.app,https://marsspace-backend.onrender.com

# Superuser Credentials
DJANGO_SUPERUSER_USERNAME=superadmin
DJANGO_SUPERUSER_PASSWORD=SuperAdmin2024!@#
DJANGO_SUPERUSER_EMAIL=superadmin@space.com

# Python Version
PYTHON_VERSION=3.10.0
```

---

### 3️⃣ PostgreSQL Database

#### Если база уже создана:
✅ Используйте существующий `DATABASE_URL`

#### Если нужно создать новую:
1. В Render Dashboard → **"New +"** → **"PostgreSQL"**
2. Настройки:
   ```
   Name: marsspace-db
   Database: marsspace_db
   User: marsspace_db_user
   Region: Frankfurt (EU Central)
   ```
3. Скопируйте **Internal Database URL** в переменную `DATABASE_URL`

---

### 4️⃣ Деплой

1. **Нажмите "Create Web Service"**
2. Render автоматически:
   - Установит зависимости
   - Применит миграции
   - Создаст суперпользователя
   - Заполнит базу тестовыми данными
   - Соберет статические файлы

3. **Дождитесь завершения** (3-5 минут)

4. **Проверьте логи:**
   ```
   ✅ Superuser superadmin created successfully!
   🌱 Seeding database with initial data...
   ✅ Created SUPER ADMIN: superadmin / SuperAdmin2024!@#
   ✅ Deployment completed successfully!
   ```

---

### 5️⃣ Проверка работоспособности

#### Тест API через curl:

```bash
# Проверка здоровья API
curl https://marsspace-backend.onrender.com/api/v1/courses/

# Тест логина
curl -X POST https://marsspace-backend.onrender.com/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Ожидаемый ответ:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 6️⃣ Frontend на Vercel

#### Обновление переменной окружения:

1. Зайдите на [Vercel Dashboard](https://vercel.com)
2. Выберите проект **mars-space**
3. **Settings** → **Environment Variables**
4. Обновите:
   ```
   VITE_API_BASE_URL=https://marsspace-backend.onrender.com/api/v1
   ```
5. **Redeploy** проект

---

### 7️⃣ Тестовые пользователи

После успешного деплоя доступны:

| Username | Password | Role | Описание |
|----------|----------|------|----------|
| `superadmin` | `SuperAdmin2024!@#` | ADMIN | Супер админ (только для вас) |
| `admin` | `admin123` | ADMIN | Обычный админ |
| `teacher1` | `teacher123` | TEACHER | Учитель |
| `student1` | `student123` | STUDENT | Студент |

---

## 🔧 Устранение проблем

### ❌ Проблема: 401 Unauthorized

**Причина:** База данных не заполнена пользователями

**Решение:**
1. Зайдите в **Render Dashboard** → Ваш сервис
2. **Shell** (справа в меню)
3. Выполните:
   ```bash
   python manage.py seed_db
   ```

---

### ❌ Проблема: CORS Error

**Причина:** Frontend URL не в whitelist

**Решение:**
Добавьте в `CORS_ALLOWED_ORIGINS`:
```
https://mars-space-59ri.vercel.app
```

---

### ❌ Проблема: Static files не загружаются

**Решение:**
```bash
python manage.py collectstatic --noinput
```

---

### ❌ Проблема: Database connection error

**Проверьте:**
1. `DATABASE_URL` правильный
2. PostgreSQL сервис запущен
3. Firewall правила разрешают подключение

---

## 📊 Мониторинг

### Логи Render:
```
Dashboard → Logs → Live Logs
```

### Метрики:
```
Dashboard → Metrics
- CPU Usage
- Memory Usage
- Request Count
- Response Time
```

---

## 🔄 Обновление после изменений

### Автоматический деплой:
1. Push в GitHub → `main` branch
2. Render автоматически задеплоит

### Ручной деплой:
1. Render Dashboard → **"Manual Deploy"** → **"Deploy latest commit"**

---

## ✅ Чеклист успешного деплоя

- [ ] PostgreSQL база создана
- [ ] Environment variables настроены
- [ ] Build успешно завершен
- [ ] Миграции применены
- [ ] Superuser создан
- [ ] База заполнена (`seed_db`)
- [ ] Static files собраны
- [ ] API отвечает на запросы
- [ ] Логин работает (тест через curl)
- [ ] Frontend подключен к backend
- [ ] CORS настроен правильно

---

## 🎯 Следующие шаги

После успешного деплоя:

1. **Тестирование:**
   - Войдите на сайт
   - Проверьте все функции
   - Протестируйте typing game
   - Попробуйте загрузить ДЗ

2. **Безопасность:**
   - Смените пароль superadmin
   - Настройте HTTPS
   - Включите rate limiting

3. **Мониторинг:**
   - Настройте alerts в Render
   - Проверяйте логи регулярно

---

## 📞 Поддержка

**Render Docs:** https://render.com/docs  
**Django Deployment:** https://docs.djangoproject.com/en/5.0/howto/deployment/

---

**Создано: 2026-01-27**  
**Версия: 2.0**
