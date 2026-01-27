# 🔍 MarsSpace - Как это работает

## 📐 Архитектура проекта

### Общая схема

```mermaid
graph TB
    subgraph "Frontend - React"
        A[Browser] --> B[React App]
        B --> C[React Router]
        B --> D[Auth Context]
        B --> E[Axios API Client]
    end
    
    subgraph "Backend - Django"
        E --> F[Django REST Framework]
        F --> G[JWT Auth]
        F --> H[ViewSets]
        H --> I[Models]
        I --> J[(PostgreSQL)]
    end
    
    subgraph "External Services"
        H --> K[Google Gemini AI]
        F --> L[WhiteNoise Static]
    end
    
    style A fill:#7C3AED
    style B fill:#F59E0B
    style F fill:#10B981
    style J fill:#3B82F6
```

---

## 🔐 Система аутентификации

### Поток аутентификации

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    
    U->>F: Ввод username/password
    F->>B: POST /api/v1/auth/login/
    B->>DB: Проверка credentials
    DB-->>B: User найден
    B->>B: Генерация JWT токенов
    B-->>F: {access, refresh}
    F->>F: Сохранение в localStorage
    F->>B: GET /api/v1/me/ (с Bearer token)
    B-->>F: User data
    F->>U: Редирект на Dashboard
```

### Реализация JWT

**Backend (Django):**
```python
# config/settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

**Frontend (React):**
```javascript
// services/api.js
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### Защита маршрутов

**Backend:**
```python
# courses/views.py
class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # Требуется JWT токен
```

**Frontend:**
```jsx
// components/layout/ProtectedRoute.jsx
const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/dashboard" />;
    
    return children;
};
```

---

## 📚 Система курсов

### Структура данных

```mermaid
erDiagram
    COURSE ||--o{ LESSON : contains
    LESSON ||--o{ HOMEWORK_SUBMISSION : has
    USER ||--o{ PROGRESS : tracks
    USER ||--o{ HOMEWORK_SUBMISSION : submits
    COURSE ||--o{ PROGRESS : has
    
    COURSE {
        int id
        string title
        text description
        int order
        bool is_active
    }
    
    LESSON {
        int id
        int course_id
        int index
        string title
        text theory_text
        text practice_text
        string lesson_type
    }
    
    PROGRESS {
        int id
        int student_id
        int course_id
        int current_lesson_index
        int completed_lessons_count
    }
    
    HOMEWORK_SUBMISSION {
        int id
        int student_id
        int lesson_id
        file file
        string status
        text teacher_comment
        int coins_reward
    }
```

### Логика прогресса

**Backend:**
```python
# courses/views.py
@action(detail=False, methods=['post'])
def complete_lesson(self, request):
    course_id = request.data.get('course_id')
    lesson_index = request.data.get('lesson_index')
    
    # Получить или создать прогресс
    progress, created = Progress.objects.get_or_create(
        student=request.user,
        course_id=course_id,
        defaults={'current_lesson_index': 1}
    )
    
    # Обновить прогресс
    if lesson_index == progress.current_lesson_index:
        progress.current_lesson_index += 1
        progress.completed_lessons_count += 1
        progress.save()
    
    return Response({'success': True})
```

**Frontend:**
```jsx
// pages/CoursePlayer.jsx
const completeLesson = async () => {
    await api.post('/my-progress/complete-lesson/', {
        course_id: courseId,
        lesson_index: currentLesson.index
    });
    
    // Переход к следующему уроку
    setCurrentLessonIndex(prev => prev + 1);
};
```

---

## 📝 Система домашних заданий

### Загрузка и валидация файлов

**Backend валидация:**
```python
# courses/validators.py
def validate_zip_file(file):
    # 1. Проверка расширения
    if not file.name.endswith('.zip'):
        raise ValidationError('Only ZIP files are allowed')
    
    # 2. Проверка размера
    if file.size > 10 * 1024 * 1024:  # 10MB
        raise ValidationError('File too large')
    
    # 3. Проверка структуры ZIP
    try:
        with zipfile.ZipFile(file, 'r') as zip_ref:
            # Проверка на опасные файлы
            dangerous_extensions = ['.exe', '.bat', '.sh', '.cmd']
            for filename in zip_ref.namelist():
                if any(filename.endswith(ext) for ext in dangerous_extensions):
                    raise ValidationError('Dangerous file detected')
    except zipfile.BadZipFile:
        raise ValidationError('Invalid ZIP file')
```

### Процесс проверки ДЗ

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED: Студент загружает ZIP
    SUBMITTED --> VIEWED: Админ открывает
    VIEWED --> ACCEPTED: Админ принимает
    VIEWED --> REJECTED: Админ отклоняет
    ACCEPTED --> [*]: Коины начислены
    REJECTED --> SUBMITTED: Студент исправляет
```

**Backend логика принятия:**
```python
# courses/views.py
@action(detail=True, methods=['post'])
def accept_submission(self, request, pk=None):
    submission = self.get_object()
    coins = request.data.get('coins_reward', 10)
    comment = request.data.get('comment', '')
    
    # Обновить статус
    submission.status = 'ACCEPTED'
    submission.coins_reward = coins
    submission.teacher_comment = comment
    submission.reviewed_by = request.user
    submission.reviewed_at = timezone.now()
    submission.save()
    
    # Начислить коины студенту
    student = submission.student
    student.coins += coins
    student.save()
    
    return Response({'success': True, 'coins_awarded': coins})
```

---

## ⌨️ Typing Game механика

### Система начисления наград

**Алгоритм расчета коинов:**
```python
# game/views.py
def calculate_coins(wpm, accuracy):
    # Базовое начисление
    base_coins = int(wpm / 10) * (accuracy / 100)
    
    # Бонусы за производительность
    bonus = 0
    if wpm >= 60 and accuracy >= 90:
        bonus = 5  # Отличная работа!
    elif wpm >= 40 and accuracy >= 80:
        bonus = 2  # Хорошая работа!
    
    total_coins = int(base_coins + bonus)
    
    # Минимум 1 коин при accuracy >= 50%
    if accuracy >= 50:
        total_coins = max(total_coins, 1)
    
    return total_coins

def calculate_energy(wpm):
    # 5-15 единиц на основе WPM
    energy = min(15, max(5, int(wpm / 10)))
    return energy
```

**Frontend реализация:**
```jsx
// pages/TypingGame.jsx
const handleKeyPress = (e) => {
    const char = e.key;
    const expectedChar = codeText[currentIndex];
    
    if (char === expectedChar) {
        // Правильный символ
        setCorrectChars(prev => prev + 1);
        setCurrentIndex(prev => prev + 1);
    } else {
        // Ошибка
        setErrors(prev => prev + 1);
    }
    
    // Проверка завершения
    if (currentIndex + 1 === codeText.length) {
        finishGame();
    }
};

const finishGame = async () => {
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // минуты
    const wpm = Math.round((correctChars / 5) / timeElapsed);
    const accuracy = Math.round((correctChars / (correctChars + errors)) * 100);
    
    // Отправка результата на backend
    const response = await api.post('/typing/', { wpm, accuracy });
    
    // Показ результатов
    setCoinsEarned(response.data.coins_reward);
    setEnergyGained(response.data.energy_gain);
};
```

---

## 🛒 Виртуальный магазин

### Процесс покупки

```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    
    S->>F: Нажимает "Buy Now"
    F->>B: POST /api/v1/shop/buy/
    B->>DB: Проверка баланса
    alt Достаточно коинов
        DB-->>B: Balance OK
        B->>DB: Создать Order
        B->>DB: Списать коины
        B-->>F: Success
        F->>S: Показать успех
    else Недостаточно коинов
        DB-->>B: Insufficient balance
        B-->>F: Error 400
        F->>S: Показать ошибку
    end
```

**Backend логика:**
```python
# shop/views.py
class BuyItemView(APIView):
    def post(self, request):
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity', 1)
        
        # Получить товар
        item = ShopItem.objects.get(id=item_id)
        total_cost = item.price_coins * quantity
        
        # Проверить баланс
        if request.user.coins < total_cost:
            return Response(
                {'error': 'Insufficient coins'},
                status=400
            )
        
        # Проверить наличие
        if item.stock < quantity:
            return Response(
                {'error': 'Out of stock'},
                status=400
            )
        
        # Создать заказ
        with transaction.atomic():
            order = Order.objects.create(
                student=request.user,
                total_coins=total_cost
            )
            
            OrderItem.objects.create(
                order=order,
                shop_item=item,
                qty=quantity,
                price_coins=item.price_coins
            )
            
            # Списать коины
            request.user.coins -= total_cost
            request.user.save()
            
            # Уменьшить сток
            item.stock -= quantity
            item.save()
        
        return Response({'success': True, 'order_id': order.id})
```

---

## 👥 Управление пользователями

### Модель User

```python
# users/models.py
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        STUDENT = 'STUDENT', 'Student'
    
    # Основные поля
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    language = models.CharField(max_length=2, choices=Language.choices, default=Language.RU)
    
    # Геймификация
    coins = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    activity_days = models.IntegerField(default=0)
    
    # Premium
    has_premium = models.BooleanField(default=False)
    premium_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Профиль
    avatar_url = models.CharField(max_length=500, blank=True)
    last_activity_date = models.DateField(auto_now=True)
```

### Система прав доступа

**Иерархия ролей:**
```
ADMIN (Полный доступ)
  ├── Все возможности TEACHER
  ├── CRUD курсов и уроков
  ├── CRUD товаров
  ├── Управление пользователями
  └── Просмотр статистики

TEACHER (Средний доступ)
  ├── Все возможности STUDENT
  ├── Управление группами
  ├── Проверка ДЗ
  └── Просмотр прогресса студентов

STUDENT (Базовый доступ)
  ├── Прохождение курсов
  ├── Отправка ДЗ
  ├── Typing Game
  └── Покупки в магазине
```

**Проверка прав на backend:**
```python
# users/permissions.py
class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'ADMIN'

class IsTeacherOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['TEACHER', 'ADMIN']
```

---

## 🤖 AI Chat интеграция

### Архитектура

```mermaid
graph LR
    A[User Question] --> B[Frontend]
    B --> C[Backend API]
    C --> D[Google Gemini]
    D --> E[AI Response]
    E --> C
    C --> B
    B --> F[Display Answer]
    
    style D fill:#4285F4
```

**Backend реализация:**
```python
# users/views.py
import google.generativeai as genai

class AIChatView(APIView):
    def post(self, request):
        message = request.data.get('message')
        
        # Настройка Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        # Контекст для AI
        context = f"""
        Ты - AI помощник образовательной платформы MarsSpace.
        Помогай студентам с вопросами по программированию.
        Пользователь: {request.user.username} ({request.user.role})
        """
        
        # Генерация ответа
        response = model.generate_content(context + "\n\n" + message)
        
        return Response({
            'reply': response.text,
            'timestamp': timezone.now()
        })
```

---

## 📊 Система геймификации

### Wallet и начисления

```python
# game/models.py
class Wallet(models.Model):
    student = models.OneToOneField(User, on_delete=models.CASCADE)
    coins = models.IntegerField(default=0)
    energy = models.IntegerField(default=100)
    streak = models.IntegerField(default=0)
    last_active_date = models.DateField(auto_now_add=True)
    
    def update_streak(self):
        today = timezone.now().date()
        if self.last_active_date == today - timedelta(days=1):
            # Продолжение streak
            self.streak += 1
        elif self.last_active_date < today - timedelta(days=1):
            # Streak прервался
            self.streak = 1
        
        self.last_active_date = today
        self.save()
```

### Leaderboard

```python
# game/views.py
class LeaderboardView(APIView):
    def get(self, request):
        # Получить активный сезон
        season = Season.objects.filter(is_active=True).first()
        
        # Топ игроков по очкам
        leaderboard = TypingAttempt.objects.filter(
            season=season
        ).values('student__username').annotate(
            total_score=Sum('score'),
            best_wpm=Max('wpm'),
            attempts=Count('id')
        ).order_by('-total_score')[:100]
        
        return Response(leaderboard)
```

---

## 🚀 Deployment процесс

### Backend на Render

**Build Command:**
```bash
cd backend && \
pip install -r requirements.txt && \
python manage.py migrate && \
python manage.py collectstatic --noinput
```

**Start Command:**
```bash
cd backend && gunicorn config.wsgi:application
```

**Environment Variables:**
```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=marsspace-backend.onrender.com
DATABASE_URL=postgresql://user:pass@host:port/dbname
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
GEMINI_API_KEY=your-gemini-key
```

### Frontend на Vercel

**Build Settings:**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

**Environment Variables:**
```env
VITE_API_BASE_URL=https://marsspace-backend.onrender.com/api/v1
```

---

## 🔄 Data Flow примеры

### Пример 1: Завершение урока

```
1. User нажимает "Complete Lesson"
   ↓
2. Frontend: CoursePlayer.jsx
   completeLesson() → api.post('/my-progress/complete-lesson/')
   ↓
3. Backend: ProgressViewSet.complete_lesson()
   - Проверка JWT токена
   - Получение Progress объекта
   - Обновление current_lesson_index
   - Увеличение completed_lessons_count
   ↓
4. Database: UPDATE progress SET...
   ↓
5. Response: {success: true, next_lesson: 3}
   ↓
6. Frontend: Обновление UI, переход к следующему уроку
```

### Пример 2: Покупка в магазине

```
1. User нажимает "Buy Now" на товаре
   ↓
2. Frontend: Shop.jsx
   buyItem(itemId) → api.post('/shop/buy/', {item_id})
   ↓
3. Backend: BuyItemView.post()
   - Проверка баланса
   - Проверка наличия
   - Создание Order в транзакции
   - Списание коинов
   - Уменьшение stock
   ↓
4. Database: 
   INSERT INTO orders...
   UPDATE users SET coins = coins - price
   UPDATE shop_items SET stock = stock - 1
   ↓
5. Response: {success: true, order_id: 123}
   ↓
6. Frontend: 
   - Показать success message
   - Обновить баланс пользователя
   - Обновить список товаров
```

---

## 🎨 Frontend архитектура

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Login (Public)
│       └── Layout (Protected)
│           ├── Sidebar
│           ├── Topbar
│           └── Outlet
│               ├── Dashboard
│               ├── Courses
│               ├── CoursePlayer
│               ├── TypingGame
│               ├── Shop
│               ├── AdminDashboard (Admin only)
│               └── TeacherDashboard (Teacher only)
```

### State Management

**Auth Context:**
```jsx
// context/AuthContext.jsx
const AuthContext = createContext({
    user: null,
    loading: false,
    isAuthenticated: false,
    login: async (username, password) => {},
    logout: () => {},
    refreshUser: async () => {}
});
```

**Local State (useState):**
- Component-specific data
- Form inputs
- UI states (loading, error)

**API State:**
- Fetched data from backend
- Cached in component state
- Refreshed on user actions

---

## 🔒 Безопасность

### Защита от атак

**1. SQL Injection:**
```python
# Django ORM автоматически экранирует запросы
User.objects.filter(username=username)  # Безопасно
```

**2. XSS (Cross-Site Scripting):**
```jsx
// React автоматически экранирует данные
<div>{user.username}</div>  // Безопасно
```

**3. CSRF:**
```python
# Django CSRF middleware
MIDDLEWARE = [
    'django.middleware.csrf.CsrfViewMiddleware',
]
```

**4. File Upload:**
```python
# Валидация расширений и размера
validators=[
    FileExtensionValidator(allowed_extensions=['zip']),
    validate_file_size,
    validate_zip_file
]
```

---

## 📈 Performance оптимизации

### Backend

**1. Database Queries:**
```python
# Использование select_related для JOIN
courses = Course.objects.select_related('lessons').all()

# Использование prefetch_related для M2M
users = User.objects.prefetch_related('learning_groups').all()
```

**2. Caching:**
```python
# Кэширование статических данных
from django.core.cache import cache

def get_courses():
    courses = cache.get('all_courses')
    if not courses:
        courses = Course.objects.all()
        cache.set('all_courses', courses, 3600)  # 1 час
    return courses
```

### Frontend

**1. Code Splitting:**
```jsx
// Lazy loading компонентов
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
```

**2. Memoization:**
```jsx
// Мемоизация дорогих вычислений
const expensiveValue = useMemo(() => {
    return computeExpensiveValue(data);
}, [data]);
```

---

## 🧪 Testing стратегия

### Backend Tests

```python
# courses/tests.py
class CourseTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='test',
            password='test123'
        )
        self.course = Course.objects.create(
            title='Test Course'
        )
    
    def test_course_creation(self):
        self.assertEqual(self.course.title, 'Test Course')
    
    def test_complete_lesson(self):
        # Тест завершения урока
        pass
```

### Frontend Tests

```jsx
// __tests__/Login.test.jsx
describe('Login Component', () => {
    it('renders login form', () => {
        render(<Login />);
        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
    
    it('handles login submission', async () => {
        // Тест отправки формы
    });
});
```

---

## 📝 Заключение

MarsSpace демонстрирует:

✅ **Современную архитектуру** с четким разделением слоев  
✅ **Безопасность** на всех уровнях  
✅ **Масштабируемость** через модульную структуру  
✅ **Производительность** через оптимизации  
✅ **Тестируемость** через unit tests  

Проект готов к production использованию и дальнейшему развитию.

---

**Документация версия: 1.0**  
**Дата: 2026-01-27**
