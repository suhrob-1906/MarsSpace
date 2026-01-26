from django.core.management.base import BaseCommand
from users.models import User, StudyGroup
from courses.models import Course, Lesson, Progress
from game.models import Season, Wallet, TypingAttempt
from shop.models import ShopItem, Order
from eduverse.models import EduverseCategory, EduverseVideo
from django.utils import timezone
import datetime

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        # 1. Users
        # Create super admin (only for you)
        if not User.objects.filter(username='superadmin').exists():
            superadmin = User.objects.create_superuser(
                username='superadmin', 
                email='superadmin@space.com', 
                password='SuperAdmin2024!@#', 
                role='ADMIN'
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Created SUPER ADMIN: superadmin / SuperAdmin2024!@#'))
        
        # Create regular admin (for testing)
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(username='admin', email='admin@space.com', password='admin123', role='ADMIN')
            self.stdout.write(f'Created admin: {admin}')
        
        teacher1, _ = User.objects.get_or_create(username='teacher1', defaults={'role': 'TEACHER', 'first_name': 'Obi-Wan', 'last_name': 'Kenobi'})
        if _:
            teacher1.set_password('teacher123')
            teacher1.save()
            self.stdout.write(f'Created teacher: {teacher1}')

        student1, _ = User.objects.get_or_create(username='student1', defaults={'role': 'STUDENT', 'first_name': 'Luke', 'last_name': 'Skywalker'})
        if _:
            student1.set_password('student123')
            student1.save()
            self.stdout.write(f'Created student: {student1}')

        # Ensure wallet exists
        if not hasattr(student1, 'wallet'):
            Wallet.objects.create(student=student1, coins=100, energy=100)

        # 2. Groups
        group1, _ = StudyGroup.objects.get_or_create(name='Jedi Padawans', defaults={'description': 'Beginners group'})
        
        # Assignments
        teacher1.teaching_groups.add(group1)
        student1.learning_groups.add(group1)
        
        # 3. Courses
        courses_data = [
            ("Python Basic", "Introduction to Python programming"),
            ("Telegram Bots + SQL", "Building bots with database"),
            ("Django Framework", "Web development with Django"),
        ]
        
        for idx, (title, desc) in enumerate(courses_data):
            course, _ = Course.objects.get_or_create(title=title, defaults={'description': desc, 'order': idx+1})
            
            # Lessons (12 placeholders)
            # Create lessons Only if they don't exist to avoid duplicates if run multiple times
            if not course.lessons.exists():
                for i in range(1, 13):
                    lesson_title = f"Topic {i}"
                    theory = f"# Theory for {title} - Lesson {i}\n\nContent goes here..."
                    practice = f"# Practice for {title} - Lesson {i}\n\nTasks go here..."
                    
                    Lesson.objects.create(
                        course=course, 
                        index=i,
                        title=lesson_title,
                        theory_text=theory,
                        practice_text=practice,
                        lesson_type='EXAM' if i == 12 else 'NORMAL'
                    )
                self.stdout.write(f'Created lessons for {title}')

        # 4. Season
        today = timezone.now().date()
        Season.objects.get_or_create(
            title="Season 1: Awakening",
            defaults={
                'start_date': today,
                'end_date': today + datetime.timedelta(days=30),
                'rewards_json': {"1": 500, "2": 300, "3": 100}
            }
        )

        # 5. Shop
        ShopItem.objects.get_or_create(title="Cyber Sword", price_coins=150, category="Avatars", defaults={'description': 'Cool sword'})
        ShopItem.objects.get_or_create(title="Neon Shield", price_coins=100, category="Avatars", defaults={'description': 'Protects you'})

        # 6. Eduverse
        cat_py, _ = EduverseCategory.objects.get_or_create(title="Python", slug="python")
        EduverseVideo.objects.get_or_create(
            category=cat_py, 
            title="Python in 100 Seconds", 
            video_url="https://www.youtube.com/watch?v=x7X9w_GIm1s",
            banner_url="https://img.youtube.com/vi/x7X9w_GIm1s/maxresdefault.jpg"
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database'))
