from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('ORGANIZER', 'Organizer'),
        ('STUDENT', 'Student'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    club = models.ForeignKey(
        'clubs.Club',   # 🔥 STRING reference (IMPORTANT)
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class StudentProfile(models.Model):
    user = models.OneToOneField(
        'users.User',   # 🔥 STRING reference
        on_delete=models.CASCADE
    )
    roll_no = models.CharField(max_length=20, unique=True)
    semester = models.IntegerField()
    section = models.CharField(max_length=10)
    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.roll_no
