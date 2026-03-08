from django.db import models
from clubs.models import Club
from users.models import User


class Event(models.Model):

    CATEGORY_CHOICES = (
        ('TECH', 'Technical'),
        ('CULTURAL', 'Cultural'),
        ('SPORTS', 'Sports'),
        ('WORKSHOP', 'Workshop'),
        ('SEMINAR', 'Seminar'),
        ('OTHER', 'Other'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES
    )

    # ✅ Event Poster / Banner Upload
    poster = models.ImageField(
        upload_to="event_posters/",
        null=True,
        blank=True
    )

    club = models.ForeignKey(
        Club,
        on_delete=models.CASCADE,
        related_name="events"
    )

    venue = models.CharField(max_length=200)

    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()

    approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ---------------------------------------------
# EVENT INTERACTION (for analytics / tracking)
# ---------------------------------------------
class EventInteraction(models.Model):

    INTERACTION_CHOICES = (
        ('VIEW', 'View'),
        ('SEARCH', 'Search'),
        ('REGISTER', 'Register'),
    )

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'STUDENT'}
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="interactions"
    )

    interaction_type = models.CharField(
        max_length=20,
        choices=INTERACTION_CHOICES
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.interaction_type}"


# ---------------------------------------------
# EVENT REGISTRATION
# ---------------------------------------------
class EventRegistration(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'STUDENT'}
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="registrations"
    )

    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'event')

    def __str__(self):
        return f"{self.student.username} → {self.event.title}"