from django.urls import path
from .views import ClubCreateView, ApproveClubView, ClubListView, ClubDetailView

urlpatterns = [
    path("clubs/", ClubListView.as_view(), name="club-list"),
    path("clubs/<int:pk>/", ClubDetailView.as_view(), name="club-detail"),
    path("clubs/create/", ClubCreateView.as_view(), name="club-create"),
    path("clubs/<int:club_id>/approve/", ApproveClubView.as_view(), name="club-approve"),
]