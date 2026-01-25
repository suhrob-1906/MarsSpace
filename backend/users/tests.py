from django.test import TestCase
from users.models import User, StudyGroup
from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status

class UserModelTest(TestCase):
    def test_user_creation(self):
        user = User.objects.create_user(username='testuser', password='password123')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('password123'))
        self.assertEqual(user.role, User.Role.STUDENT) # Default role
        self.assertEqual(user.language, User.Language.RU) # Default language

    def test_admin_user_creation(self):
        admin_user = User.objects.create_superuser(username='admin', password='adminpassword', role=User.Role.ADMIN)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        self.assertEqual(admin_user.role, User.Role.ADMIN)

    def test_user_role_choices(self):
        user = User.objects.create_user(username='teacher', password='password', role=User.Role.TEACHER)
        self.assertEqual(user.role, User.Role.TEACHER)

    def test_user_language_choices(self):
        user_ru = User.objects.create_user(username='user_ru', password='password', language=User.Language.RU)
        self.assertEqual(user_ru.language, User.Language.RU)
        user_uz = User.objects.create_user(username='user_uz', password='password', language=User.Language.UZ)
        self.assertEqual(user_uz.language, User.Language.UZ)
        
        # Test default language
        user_default = User.objects.create_user(username='user_default', password='password')
        self.assertEqual(user_default.language, User.Language.RU) # Default should be 'ru'


class StudyGroupModelTest(TestCase):
    def test_study_group_creation(self):
        group = StudyGroup.objects.create(name='Test Group', description='A group for testing')
        self.assertEqual(group.name, 'Test Group')
        self.assertEqual(group.description, 'A group for testing')
        self.assertTrue(group.is_active)

    def test_study_group_default_active(self):
        group = StudyGroup.objects.create(name='Another Group')
        self.assertTrue(group.is_active)

    def test_study_group_str_representation(self):
        group = StudyGroup.objects.create(name='Str Test Group')
        self.assertEqual(str(group), 'Str Test Group')


class MeViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.me_url = reverse('me') # Assuming 'me' is the name for the MeView URL

    def test_authenticated_user_can_access_me_view(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)

    def test_unauthenticated_user_cannot_access_me_view(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserViewSetTest(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(username='admin', password='adminpassword')
        self.normal_user = User.objects.create_user(username='normaluser', password='normalpassword')
        self.user_list_url = reverse('user-list')
        self.user_detail_url = reverse('user-detail', args=[self.normal_user.id])

    def test_admin_can_list_users(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.user_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), User.objects.count())

    def test_admin_can_retrieve_user(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.user_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.normal_user.username)

    def test_admin_can_create_user(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'username': 'newuser', 'password': 'newpassword', 'role': User.Role.STUDENT}
        response = self.client.post(self.user_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_admin_can_update_user(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'username': 'updateduser'}
        response = self.client.patch(self.user_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.normal_user.refresh_from_db()
        self.assertEqual(self.normal_user.username, 'updateduser')

    def test_admin_can_delete_user(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.user_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.normal_user.id).exists())

    def test_normal_user_cannot_list_users(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.user_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_normal_user_cannot_retrieve_user(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.user_detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_list_users(self):
        response = self.client.get(self.user_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class StudyGroupViewSetTest(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(username='admin', password='adminpassword')
        self.normal_user = User.objects.create_user(username='normaluser', password='normalpassword')
        self.group = StudyGroup.objects.create(name='Test Group')
        self.group_list_url = reverse('studygroup-list')
        self.group_detail_url = reverse('studygroup-detail', args=[self.group.id])

    def test_admin_can_list_study_groups(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.group_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), StudyGroup.objects.count())

    def test_admin_can_retrieve_study_group(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.group_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.group.name)

    def test_admin_can_create_study_group(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'name': 'New Group', 'description': 'Description for new group'}
        response = self.client.post(self.group_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(StudyGroup.objects.filter(name='New Group').exists())

    def test_admin_can_update_study_group(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'name': 'Updated Group'}
        response = self.client.patch(self.group_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.group.refresh_from_db()
        self.assertEqual(self.group.name, 'Updated Group')

    def test_admin_can_delete_study_group(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.group_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(StudyGroup.objects.filter(id=self.group.id).exists())

    def test_normal_user_cannot_list_study_groups(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.group_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_normal_user_cannot_retrieve_study_group(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.group_detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_list_study_groups(self):
        response = self.client.get(self.group_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)