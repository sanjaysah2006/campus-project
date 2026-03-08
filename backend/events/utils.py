from calendar_app.models import AcademicCalendar

def is_event_conflicting(start_dt, end_dt):
    """
    Returns True if event overlaps with any EXAM period
    """
    return AcademicCalendar.objects.filter(
        type='EXAM',
        start_date__lte=end_dt.date(),
        end_date__gte=start_dt.date()
    ).exists()
