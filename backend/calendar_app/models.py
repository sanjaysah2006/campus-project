from django.db import models


class AcademicCalendarUpload(models.Model):
    pdf = models.FileField(upload_to='academic_calendars/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Calendar Upload {self.id}"


class AcademicCalendar(models.Model):
    EVENT_TYPE_CHOICES = (
        ('EXAM', 'Exam'),
        ('HOLIDAY', 'Holiday'),
    )

    title = models.CharField(max_length=100)
    type = models.CharField(
        max_length=20,
        choices=EVENT_TYPE_CHOICES
    )
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.title} ({self.type})"
