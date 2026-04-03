# requests/urls.py

from django.urls import path
from .views import RequestListView, CreateRequestView, UpdateRequestStatusView

urlpatterns = [
    path("", RequestListView.as_view()),
    path("create/", CreateRequestView.as_view()),
    path("<int:pk>/update/", UpdateRequestStatusView.as_view()),
]