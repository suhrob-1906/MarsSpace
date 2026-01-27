from django.db import models
from django.conf import settings

class Attendance(models.Model):
    """Track student attendance in study groups"""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance_records')
    group = models.ForeignKey('users.StudyGroup', on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    is_present = models.BooleanField(default=False)
    marked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='marked_attendance')
    marked_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, help_text="Optional notes about attendance")
    
    class Meta:
        ordering = ['-date']
        unique_together = ['student', 'group', 'date']
    
    def __str__(self):
        status = "Present" if self.is_present else "Absent"
        return f"{self.student.username} - {self.group.name} - {self.date} ({status})"
