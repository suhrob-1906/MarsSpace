import os
import django
import datetime
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, StudyGroup

def setup_teacher_data():
    # 1. Create or get Teacher
    teacher, created = User.objects.get_or_create(
        username='teacher1',
        defaults={
            'email': 'teacher1@example.com',
            'first_name': 'Sarah',
            'last_name': 'Connor',
            'role': 'TEACHER',
            'is_staff': False
        }
    )
    if created:
        teacher.set_password('password123')
        teacher.save()
        print(f"Created teacher: {teacher.username}")
    else:
        print(f"Found teacher: {teacher.username}")

    # 2. Create Students
    students = []
    for i in range(1, 4):
        s, _ = User.objects.get_or_create(
            username=f'student{i}',
            defaults={
                'role': 'STUDENT',
                'first_name': f'Student',
                'last_name': f'{i}'
            }
        )
        if _:
            s.set_password('password123')
            s.save()
        students.append(s)
    print(f"Ensured {len(students)} students exist")

    # 3. Create Study Group
    today_name = timezone.now().strftime('%A') # e.g., "Monday"
    
    group, created = StudyGroup.objects.get_or_create(
        name='Python Fundamentals',
        defaults={
            'description': 'Introductory Python course group',
            'days_of_week': [today_name, 'Friday'], # basic schedule
            'start_time': datetime.time(9, 0),
            'end_time': datetime.time(18, 0), # Broad range for testing
            'is_active': True
        }
    )
    
    # Update schedule to ensure it includes today for testing
    if today_name not in group.days_of_week:
        group.days_of_week.append(today_name)
        group.save()
        
    print(f"Configured group: {group.name} (Schedule: {group.days_of_week})")

    # 4. Assign relations
    # Use the reverse relation names from User model
    # teaching_groups = ManyToManyField('StudyGroup', related_name='teachers')
    # learning_groups = ManyToManyField('StudyGroup', related_name='students')
    
    group.teachers.add(teacher)
    for s in students:
        group.students.add(s)
        
    print("Assigned teacher and students to group.")
    print("\n------------------------------------------------")
    print("DONE! Login with:")
    print(f"Username: {teacher.username}")
    print("Password: password123")
    print("------------------------------------------------")

if __name__ == '__main__':
    setup_teacher_data()
