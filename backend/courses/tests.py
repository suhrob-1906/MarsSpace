from django.test import TestCase
from users.models import User
from courses.models import Course, Lesson, Progress, HomeworkSubmission
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
import os

class CourseModelTest(TestCase):
    def test_course_creation(self):
        course = Course.objects.create(title='Python Basics', description='Intro to Python', order=1)
        self.assertEqual(course.title, 'Python Basics')
        self.assertEqual(course.description, 'Intro to Python')
        self.assertEqual(course.order, 1)
        self.assertTrue(course.is_active)

    def test_course_str_representation(self):
        course = Course.objects.create(title='Advanced Python')
        self.assertEqual(str(course), 'Advanced Python')

    def test_course_ordering(self):
        Course.objects.create(title='Course A', order=3)
        Course.objects.create(title='Course B', order=1)
        Course.objects.create(title='Course C', order=2)
        courses = Course.objects.all()
        self.assertEqual(courses[0].title, 'Course B')
        self.assertEqual(courses[1].title, 'Course C')
        self.assertEqual(courses[2].title, 'Course A')


class LessonModelTest(TestCase):
    def setUp(self):
        self.course = Course.objects.create(title='Test Course')

    def test_lesson_creation(self):
        lesson = Lesson.objects.create(course=self.course, index=1, title='Lesson 1', theory_text='Theory', practice_text='Practice')
        self.assertEqual(lesson.course, self.course)
        self.assertEqual(lesson.index, 1)
        self.assertEqual(lesson.title, 'Lesson 1')
        self.assertEqual(lesson.lesson_type, Lesson.Type.NORMAL)
        self.assertTrue(lesson.is_active)

    def test_lesson_str_representation(self):
        lesson = Lesson.objects.create(course=self.course, index=2, title='Lesson 2')
        self.assertEqual(str(lesson), f"{self.course.title} - 2. Lesson 2")

    def test_lesson_ordering(self):
        Lesson.objects.create(course=self.course, index=3, title='Lesson 3')
        Lesson.objects.create(course=self.course, index=1, title='Lesson 1')
        Lesson.objects.create(course=self.course, index=2, title='Lesson 2')
        lessons = Lesson.objects.filter(course=self.course)
        self.assertEqual(lessons[0].title, 'Lesson 1')
        self.assertEqual(lessons[1].title, 'Lesson 2')
        self.assertEqual(lessons[2].title, 'Lesson 3')

    def test_lesson_unique_together(self):
        Lesson.objects.create(course=self.course, index=1, title='First Lesson')
        with self.assertRaises(Exception): # IntegrityError
            Lesson.objects.create(course=self.course, index=1, title='Duplicate Lesson')


class ProgressModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='student', password='password')
        self.course = Course.objects.create(title='Test Course')

    def test_progress_creation(self):
        progress = Progress.objects.create(student=self.user, course=self.course, current_lesson_index=5)
        self.assertEqual(progress.student, self.user)
        self.assertEqual(progress.course, self.course)
        self.assertEqual(progress.current_lesson_index, 5)
        self.assertEqual(progress.completed_lessons_count, 0)

    def test_progress_str_representation(self):
        progress = Progress.objects.create(student=self.user, course=self.course)
        self.assertEqual(str(progress), f"{self.user.username} - {self.course.title} (1)")

    def test_progress_unique_together(self):
        Progress.objects.create(student=self.user, course=self.course)
        with self.assertRaises(Exception): # IntegrityError
            Progress.objects.create(student=self.user, course=self.course)


class HomeworkSubmissionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='student', password='password')
        self.course = Course.objects.create(title='Test Course')
        self.lesson = Lesson.objects.create(course=self.course, index=1, title='Test Lesson')
        # Create a dummy file for testing
        self.dummy_file_content = b"file_content_for_test"
        self.dummy_file_name = "test_file.txt"
        self.file = SimpleUploadedFile(self.dummy_file_name, self.dummy_file_content, content_type="text/plain")

    def test_homework_submission_creation(self):
        submission = HomeworkSubmission.objects.create(
            student=self.user,
            lesson=self.lesson,
            file=self.file,
            status=HomeworkSubmission.Status.SUBMITTED
        )
        self.assertEqual(submission.student, self.user)
        self.assertEqual(submission.lesson, self.lesson)
        self.assertEqual(submission.file.read(), self.dummy_file_content)
        self.assertEqual(submission.status, HomeworkSubmission.Status.SUBMITTED)
        self.assertIsNotNone(submission.created_at)

    def test_homework_submission_str_representation(self):
        submission = HomeworkSubmission.objects.create(
            student=self.user,
            lesson=self.lesson,
            file=self.file,
            status=HomeworkSubmission.Status.VIEWED
        )
        self.assertEqual(str(submission), f"{self.user.username} - {self.lesson} - VIEWED")


class CourseViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.course = Course.objects.create(title='Test Course', description='Test Description')
        self.lesson = Lesson.objects.create(course=self.course, index=1, title='Test Lesson')
        self.course_list_url = reverse('course-list')
        self.course_detail_url = reverse('course-detail', args=[self.course.id])

    def test_authenticated_user_can_list_courses(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.course_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], self.course.title)

    def test_authenticated_user_can_retrieve_course_detail(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.course_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.course.title)
        self.assertIn('lessons', response.data)
        self.assertEqual(len(response.data['lessons']), 1)
        self.assertEqual(response.data['lessons'][0]['title'], self.lesson.title)

    def test_unauthenticated_user_cannot_list_courses(self):
        response = self.client.get(self.course_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_user_cannot_retrieve_course_detail(self):
        response = self.client.get(self.course_detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_cannot_create_course(self):
        self.client.force_authenticate(user=self.user)
        data = {'title': 'New Course', 'description': 'New Description'}
        response = self.client.post(self.course_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_authenticated_user_cannot_update_course(self):
        self.client.force_authenticate(user=self.user)
        data = {'title': 'Updated Course'}
        response = self.client.patch(self.course_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_authenticated_user_cannot_delete_course(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.course_detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ProgressViewSetTest(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password')
        self.user2 = User.objects.create_user(username='user2', password='password')
        self.course1 = Course.objects.create(title='Course 1')
        self.course2 = Course.objects.create(title='Course 2')
        self.lesson1_c1 = Lesson.objects.create(course=self.course1, index=1, title='Lesson 1 C1')
        self.lesson2_c1 = Lesson.objects.create(course=self.course1, index=2, title='Lesson 2 C1')
        self.lesson1_c2 = Lesson.objects.create(course=self.course2, index=1, title='Lesson 1 C2')
        
        self.progress_user1_c1 = Progress.objects.create(student=self.user1, course=self.course1, current_lesson_index=1, completed_lessons_count=0)
        self.progress_user2_c2 = Progress.objects.create(student=self.user2, course=self.course2, current_lesson_index=5, completed_lessons_count=4)
        
        self.progress_list_url = reverse('progress-list')
        self.complete_lesson_url = reverse('progress-complete-lesson') # URL for the custom action
        self.progress_detail_url = reverse('progress-detail', args=[self.progress_user1_c1.id])

    def test_authenticated_user_can_list_own_progress(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.progress_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['course'], self.course1.id)

    def test_authenticated_user_can_retrieve_own_progress(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.progress_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['course'], self.course1.id)

    def test_authenticated_user_cannot_list_other_users_progress(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.progress_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        # Ensure user1 only sees their own progress, not user2's
        self.assertNotIn(self.progress_user2_c2.id, [p['id'] for p in response.data])

    def test_authenticated_user_cannot_retrieve_other_users_progress(self):
        self.client.force_authenticate(user=self.user1)
        other_user_progress_detail_url = reverse('progress-detail', args=[self.progress_user2_c2.id])
        response = self.client.get(other_user_progress_detail_url)
        # This will be a 404 because get_queryset filters it out
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_user_cannot_list_progress(self):
        response = self.client.get(self.progress_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_user_cannot_retrieve_progress(self):
        response = self.client.get(self.progress_detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_complete_next_lesson(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(self.complete_lesson_url, {'lesson_id': self.lesson1_c1.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.progress_user1_c1.refresh_from_db()
        self.assertEqual(self.progress_user1_c1.current_lesson_index, 2)
        self.assertEqual(self.progress_user1_c1.completed_lessons_count, 1)

    def test_authenticated_user_cannot_complete_lesson_out_of_order(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(self.complete_lesson_url, {'lesson_id': self.lesson2_c1.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Please complete previous lessons first', response.data['detail'])

    def test_authenticated_user_can_re_complete_already_completed_lesson(self):
        self.client.force_authenticate(user=self.user1)
        # Complete lesson 1
        self.client.post(self.complete_lesson_url, {'lesson_id': self.lesson1_c1.id}, format='json')
        self.progress_user1_c1.refresh_from_db()
        self.assertEqual(self.progress_user1_c1.current_lesson_index, 2)
        self.assertEqual(self.progress_user1_c1.completed_lessons_count, 1)

        # Try to complete lesson 1 again
        response = self.client.post(self.complete_lesson_url, {'lesson_id': self.lesson1_c1.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Lesson already completed', response.data['detail'])
        self.progress_user1_c1.refresh_from_db()
        self.assertEqual(self.progress_user1_c1.current_lesson_index, 2) # Should not change
        self.assertEqual(self.progress_user1_c1.completed_lessons_count, 1) # Should not change

    def test_authenticated_user_cannot_complete_nonexistent_lesson(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(self.complete_lesson_url, {'lesson_id': 9999}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('Lesson not found', response.data['detail'])

    def test_unauthenticated_user_cannot_complete_lesson(self):
        response = self.client.post(self.complete_lesson_url, {'lesson_id': self.lesson1_c1.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class HomeworkSubmissionViewSetTest(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='student1', password='password')
        self.user2 = User.objects.create_user(username='student2', password='password')
        self.course = Course.objects.create(title='Course')
        self.lesson = Lesson.objects.create(course=self.course, index=1, title='Lesson 1')
        self.submission1 = HomeworkSubmission.objects.create(
            student=self.user1,
            lesson=self.lesson,
            file=SimpleUploadedFile("file1.txt", b"file_content_1"),
            teacher_comment="Good job",
            status=HomeworkSubmission.Status.ACCEPTED
        )
        self.submission2 = HomeworkSubmission.objects.create(
            student=self.user2,
            lesson=self.lesson,
            file=SimpleUploadedFile("file2.txt", b"file_content_2"),
            status=HomeworkSubmission.Status.SUBMITTED
        )
        self.submission_list_url = reverse('homeworksubmission-list')
        self.submission_detail_url = reverse('homeworksubmission-detail', args=[self.submission1.id])

    def tearDown(self):
        # Clean up media files created during tests
        for submission in HomeworkSubmission.objects.all():
            if submission.file:
                submission.file.delete()
        # Ensure media root is clean
        if os.path.exists('media/homework_uploads'):
            os.rmdir('media/homework_uploads')

    def test_authenticated_user_can_list_own_submissions(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.submission_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.submission1.id)

    def test_authenticated_user_can_retrieve_own_submission(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.submission_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.submission1.id)

    def test_authenticated_user_can_create_submission(self):
        self.client.force_authenticate(user=self.user1)
        new_file = SimpleUploadedFile("new_file.txt", b"new_file_content")
        data = {'lesson': self.lesson.id, 'file': new_file}
        response = self.client.post(self.submission_list_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(HomeworkSubmission.objects.filter(student=self.user1, lesson=self.lesson).exists())
        self.assertEqual(HomeworkSubmission.objects.get(id=response.data['id']).file.read(), b"new_file_content")

    def test_authenticated_user_cannot_list_other_users_submissions(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.submission_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertNotIn(self.submission2.id, [s['id'] for s in response.data])

    def test_authenticated_user_cannot_retrieve_other_users_submission(self):
        self.client.force_authenticate(user=self.user1)
        other_submission_detail_url = reverse('homeworksubmission-detail', args=[self.submission2.id])
        response = self.client.get(other_submission_detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_authenticated_user_can_update_own_submission(self):
        self.client.force_authenticate(user=self.user1)
        updated_file = SimpleUploadedFile("updated_file.txt", b"updated_content")
        data = {'file': updated_file}
        response = self.client.patch(self.submission_detail_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.submission1.refresh_from_db()
        self.assertEqual(self.submission1.file.read(), b"updated_content")
    
    def test_authenticated_user_cannot_update_submission_status_or_comment(self):
        self.client.force_authenticate(user=self.user1)
        data = {'status': HomeworkSubmission.Status.ACCEPTED, 'teacher_comment': 'Changed'}
        response = self.client.patch(self.submission_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK) # DRF allows update but ReadOnlyField prevents change
        self.submission1.refresh_from_db()
        self.assertEqual(self.submission1.status, HomeworkSubmission.Status.ACCEPTED) # Should still be accepted
        self.assertEqual(self.submission1.teacher_comment, "Good job") # Should still be Good job

    def test_authenticated_user_cannot_delete_submission(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(self.submission_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(HomeworkSubmission.objects.filter(id=self.submission1.id).exists())

    def test_unauthenticated_user_cannot_access_submissions(self):
        response = self.client.get(self.submission_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)