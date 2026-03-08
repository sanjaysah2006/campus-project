from django.urls import path
from .views import (
    AdminAllEventsView,
    EventCreateView,
    EventDetailView,
    StudentDashboardView,
    EventRegisterView,
    EventRecommendationView,
    AdminApproveEventView,
    AdminPendingEventsView,
    AdminDashboardStats,
    EventViewTrack,
    OrganizerEventHistoryView,
)

urlpatterns = [
    # Create Event
    path("events/create/", EventCreateView.as_view()),
    path("events/<int:event_id>/detail/", EventDetailView.as_view()),
    path("events/<int:pk>/", EventDetailView.as_view()),
    # Student
    path("student/events/", StudentDashboardView.as_view()),
    path("student/events/<int:event_id>/register/", EventRegisterView.as_view()),
    path("student/events/<int:event_id>/view/", EventViewTrack.as_view()),
    path("student/recommendations/", EventRecommendationView.as_view()),

    # Organizer
    path("organizer/events/history/", OrganizerEventHistoryView.as_view()),

    # Admin
    path("admin/events/<int:event_id>/approve/", AdminApproveEventView.as_view()),
    path("admin/events/pending/", AdminPendingEventsView.as_view()),
    path("admin/dashboard/", AdminDashboardStats.as_view()),
    path("admin/events/all/", AdminAllEventsView.as_view()),
]