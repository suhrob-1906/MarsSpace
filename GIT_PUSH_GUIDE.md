# 🚀 Команды для пуша на GitHub

## Вариант 1: Первый раз (новый репозиторий)

### 1. Инициализировать Git (если еще не сделано):

```bash
cd C:\Users\LENOVO\Downloads\MarsSpace
git init
```

### 2. Добавить все файлы:

```bash
git add .
```

### 3. Сделать первый коммит:

```bash
git commit -m "Initial commit: MarsSpace Educational Platform

- Backend: Django 5.2 with DRF
- Frontend: React 19.2 with Vite
- Features: Courses, Typing Game, AI Assistant, Homework System
- Gamification: Coins, Points, Leaderboard
- Multi-language support: RU, EN, UZ
- Latest updates: Teacher stats fix, WPM tracking, AI Gemini 1.5 Flash"
```

### 4. Создать репозиторий на GitHub:

1. Откройте https://github.com/new
2. Название: `MarsSpace`
3. Описание: `Educational platform for programming with gamification and AI assistant`
4. Выберите: **Public** или **Private**
5. **НЕ** добавляйте README, .gitignore, license (у нас уже есть)
6. Нажмите **Create repository**

### 5. Подключить удаленный репозиторий:

```bash
# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/MarsSpace.git
```

### 6. Отправить код на GitHub:

```bash
git branch -M main
git push -u origin main
```

---

## Вариант 2: Обновить существующий репозиторий

### 1. Проверить статус:

```bash
git status
```

### 2. Добавить изменения:

```bash
# Добавить все файлы
git add .

# Или добавить конкретные файлы
git add backend/users/models.py
git add backend/users/views.py
git add frontend/src/pages/Dashboard.jsx
```

### 3. Сделать коммит:

```bash
git commit -m "Fix: Update teacher stats, WPM tracking, and AI integration

- Fixed teacher dashboard student count (filter by STUDENT role)
- Added last_wpm field to User model with migration
- Moved leaderboard from typing game to student dashboard
- Updated AI to Gemini 1.5 Flash model
- Improved AI error handling
- Complete project health check"
```

### 4. Отправить на GitHub:

```bash
git push origin main
```

---

## Вариант 3: Пошаговые команды (копируй и вставляй)

```bash
# 1. Перейти в директорию проекта
cd C:\Users\LENOVO\Downloads\MarsSpace

# 2. Проверить статус Git
git status

# 3. Добавить все изменения
git add .

# 4. Создать коммит
git commit -m "Latest updates: Teacher stats, WPM tracking, AI Gemini 1.5 Flash"

# 5. Отправить на GitHub
git push origin main
```

---

## 📋 Полезные Git команды

### Проверить изменения:
```bash
git status                    # Статус файлов
git diff                      # Посмотреть изменения
git log --oneline            # История коммитов
```

### Работа с ветками:
```bash
git branch                    # Список веток
git checkout -b feature/new   # Создать новую ветку
git checkout main            # Переключиться на main
git merge feature/new        # Слить ветку
```

### Отменить изменения:
```bash
git restore <file>           # Отменить изменения в файле
git reset HEAD~1             # Отменить последний коммит
git reset --hard origin/main # Сбросить до версии на GitHub
```

### Синхронизация:
```bash
git pull origin main         # Получить изменения с GitHub
git fetch origin            # Получить информацию о изменениях
```

---

## ⚠️ Важно перед пушем!

### 1. Создать .gitignore (если нет):

```bash
# В корне проекта создайте файл .gitignore
```

Содержимое `.gitignore`:
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
*.egg-info/
dist/
build/

# Django
*.log
db.sqlite3
media/
staticfiles/

# Environment
.env
*.env

# Node
node_modules/
dist/
.cache/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### 2. Проверить что .env НЕ в Git:

```bash
git status
```

Если видите `.env` файлы - добавьте их в `.gitignore`!

### 3. Удалить .env из Git (если случайно добавили):

```bash
git rm --cached backend/.env
git rm --cached frontend/.env
git commit -m "Remove .env files from Git"
```

---

## 🔐 Безопасность

**НИКОГДА не пушьте на GitHub:**
- ❌ `.env` файлы
- ❌ API ключи (GEMINI_API_KEY)
- ❌ SECRET_KEY
- ❌ Пароли баз данных
- ❌ Токены доступа

**Все секреты должны быть в:**
- ✅ `.env` файлах (локально)
- ✅ Environment Variables на Render/Vercel

---

## ✅ Готово!

После успешного пуша:
1. Откройте https://github.com/YOUR_USERNAME/MarsSpace
2. Проверьте что все файлы на месте
3. Убедитесь что `.env` файлов НЕТ в репозитории
4. Добавьте описание и теги в настройках репозитория

**Ваш проект теперь на GitHub!** 🎉
