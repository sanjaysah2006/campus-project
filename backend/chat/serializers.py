from rest_framework import serializers
from .models import Conversation, Message
from users.models import User


# 👤 USER SERIALIZER
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


# 💬 MESSAGE SERIALIZER
class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "content", "created_at"]


# 💬 CONVERSATION SERIALIZER
class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    # ✅ CLUB DATA
    club_name = serializers.CharField(source="club.name", read_only=True)
    club_id = serializers.IntegerField(source="club.id", read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "participants",
            "club_id",
            "club_name",
            "last_message",
            "created_at",
        ]

    def get_last_message(self, obj):
        last = obj.messages.order_by("-created_at").first()
        return MessageSerializer(last).data if last else None