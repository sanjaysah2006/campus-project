from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from users.models import User


# 📩 LIST CONVERSATIONS
class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            participants=request.user
        ).prefetch_related("participants", "messages", "club").order_by("-created_at")

        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)


# 📩 GET MESSAGES
class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        messages = Message.objects.filter(
            conversation_id=conversation_id
        ).order_by("created_at")

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


# ✉️ SEND MESSAGE
class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        conversation_id = request.data.get("conversation_id")
        content = request.data.get("content")

        if not conversation_id or not content:
            return Response(
                {"detail": "conversation_id and content required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response(
                {"detail": "Conversation not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )

        return Response(MessageSerializer(message).data, status=201)


# ✅ FIXED: CreateConversationView
class CreateConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get("user_id")
        club_id = request.data.get("club_id")  # optional, used only on creation

        if not user_id:
            return Response({"detail": "user_id required"}, status=400)

        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        if other_user == request.user:
            return Response({"detail": "Cannot chat with yourself"}, status=400)

        # ✅ FIX: Find existing conversation between these two users
        # regardless of who initiated it or what club_id was passed.
        # Previously filtering by club_id caused A→B and B→A to create
        # separate conversations when club_id differed or was null.
        conversation = (
            Conversation.objects
            .annotate(num_participants=Count("participants"))
            .filter(num_participants=2)
            .filter(participants=request.user)
            .filter(participants=other_user)
            .first()
        )

        # ✅ Create only if no existing conversation found
        if not conversation:
            conversation = Conversation.objects.create(
                club_id=club_id  # attach club only on first creation
            )
            conversation.participants.add(request.user, other_user)

        return Response({"conversation_id": conversation.id}, status=200)