# requests/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import AssistanceRequest
from .serializers import AssistanceRequestSerializer
from clubs.models import Club


# 📩 LIST REQUESTS
class RequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # 🔥 ONLY show requests for organizer's club
        requests = AssistanceRequest.objects.filter(
            club__organizer=request.user
        ).order_by("-created_at")

        serializer = AssistanceRequestSerializer(requests, many=True)
        return Response(serializer.data)


# ➕ CREATE REQUEST
class CreateRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        club_id = request.data.get("club")
        title = request.data.get("title")
        description = request.data.get("description")

        if not club_id or not title or not description:
            return Response(
                {"error": "club, title, description required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            club = Club.objects.get(id=club_id)
        except Club.DoesNotExist:
            return Response({"error": "Club not found"}, status=404)

        req = AssistanceRequest.objects.create(
            club=club,
            requester=request.user,
            title=title,
            description=description
        )

        return Response(
            AssistanceRequestSerializer(req).data,
            status=201
        )


# 🔄 UPDATE STATUS
class UpdateRequestStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            req = AssistanceRequest.objects.get(id=pk)
        except AssistanceRequest.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        # Only organizer allowed
        if req.club.organizer != request.user:
            return Response({"error": "Not allowed"}, status=403)

        status_value = request.data.get("status")

        if status_value not in ["pending", "accepted", "completed"]:
            return Response({"error": "Invalid status"}, status=400)

        req.status = status_value
        req.save()

        return Response(AssistanceRequestSerializer(req).data)