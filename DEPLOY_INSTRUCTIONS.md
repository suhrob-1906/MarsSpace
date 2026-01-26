# 🚀 Инструкция по Деплою MarsSpace

## ✅ Что исправлено

1. **Backend**: CORS конфигурация, Database URL обработка
2. **Frontend**: Tailwind CSS v4 совместимость
3. **Build script**: Unix line endings (LF)
4. **Валидация файлов**: HomeworkSubmission с проверкой размера и типа

## 📝 Шаг 1: Render (Backend)

### Environment Variables
Добавьте в Render Web Service → Environment:

```
SECRET_KEY=ваш_секретный_ключ_сгенерируйте_новый
DEBUG=False
ALLOWED_HOSTS=*.onrender.com
DATABASE_URL=postgresql://marsspace_db_user:wDPtA8hFj5qTLu7zaDaU60VRNvPKIOUq@dpg-d5r0n5hr0fns73drljeg-a/marsspace_db
CORS_ALLOWED_ORIGINS=https://ваш-домен.vercel.app
CSRF_TRUSTED_ORIGINS=https://ваш-домен.vercel.app
PYTHON_VERSION=3.10.0
```

### Build & Start Commands
- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn config.wsgi:application --chdir ./backend`

## 📝 Шаг 2: Vercel (Frontend)

### Environment Variables
```
VITE_API_URL=https://ваш-backend.onrender.com/api/v1
```

### Settings
- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 🔗 Шаг 3: Финальная связка

После деплоя фронтенда:
1. Скопируйте URL из Vercel
2. Обновите `CORS_ALLOWED_ORIGINS` и `CSRF_TRUSTED_ORIGINS` на Render
3. Render автоматически перезапустит сервис

## ✅ Готово!
Проект готов к работе.
