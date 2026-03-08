from django.db import models
from users.models import User


class Club(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
    max_length=100,
    default="GENERAL"
)

    organizer = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'ORGANIZER'},
        related_name="organized_club"   # ✅ ADD THIS
    )

    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name