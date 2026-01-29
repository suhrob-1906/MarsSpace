from rest_framework import permissions
from django.utils import timezone

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'TEACHER'

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'STUDENT'

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsPremiumUser(permissions.BasePermission):
    """
    Allows access only to users with an active premium subscription.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Admins and Teachers always get access
        if request.user.role in ['ADMIN', 'TEACHER']:
            return True
            
        # Check if premium is active
        if request.user.has_premium and request.user.premium_expires_at:
            return request.user.premium_expires_at > timezone.now()
            
        return False
