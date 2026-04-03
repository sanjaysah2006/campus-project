from django.urls import path
from .views import (
    ConversationListView,
    MessageListView,
    SendMessageView,
    CreateConversationView,
)

urlpatterns = [
    path("conversations/", ConversationListView.as_view()),
    path("messages/<int:conversation_id>/", MessageListView.as_view()),
    path("send/", SendMessageView.as_view()),
    path("create/", CreateConversationView.as_view()),
]