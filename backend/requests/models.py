# requests/models.py

from django.db import models
from users.models import User
from clubs.models import Club


class AssistanceRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("completed", "Completed"),
    ]

    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="requests")
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_requests")

    title = models.CharField(max_length=255)
    description = models.TextField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"