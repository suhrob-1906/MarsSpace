# Space MVP Platform

**Space** is a gamified educational platform for students, inspired by Mars Space. It features courses, typing games, a virtual shop, and seasonal leaderboards.

## 🚀 Features

- **Gamification**: Earn **Coins** and **Energy** by completing lessons and playing typing games.
- **Typing Game**: Competitive typing trainer with WPM and Accuracy tracking.
- **Seasons**: Monthly leaderboards with rewards for top students.
- **Shop**: Spend earned coins on virtual avatars and items.
- **Roles**:
  - **Student**: Take courses, submit homework (ZIP), play games, buy items.
  - **Teacher**: Manage groups, review homework submissions (Accept/Reject).
  - **Admin**: Full control over users, courses, shop items, and seasons.

## 🛠 Tech Stack

- **Backend**: Django 5 + Django REST Framework + JWT
- **Database**: PostgreSQL (Production) / SQLite (Dev)
- **Frontend**: React + Vite + Tailwind CSS
- **Deployment**: Render (Backend) + Vercel (Frontend)

## 📦 Project Structure

```
/backend    # Django Project
  /config   # Settings & URLs
  /users    # Auth, User, Group models
  /courses  # Course, Lesson, Progress logic
  /game     # Typing, Season, Wallet logic
  /shop     # ShopItem, Order logic
  /eduverse # Blog & Extra materials

/frontend   # React Project
  /src
    /components  # UI & Layout
    /pages       # Full page views
    /context     # Auth state
```

## 🏃‍♂️ Getting Started (Local)

### 1. Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_db  # Populates initial data (admin/admin123, student1/student123)
python manage.py runserver
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Login Credentials
- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher1` / `teacher123`
- **Student**: `student1` / `student123`

## 📚 API Documentation

The backend provides a REST API.
- **Swagger/Redoc**: Not configured in MVP but endpoints follow standard REST patterns.
- **Auth**: `POST /api/auth/login/` returns `access` and `refresh` tokens.

## 🛡 License
Internal Project.
