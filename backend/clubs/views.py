from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Club
from .serializers import ClubSerializer, ClubCreateSerializer


# LIST ALL CLUBS
class ClubListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clubs = Club.objects.filter(approved=True)
        serializer = ClubSerializer(clubs, many=True)
        return Response(serializer.data)


# GET SINGLE CLUB
class ClubDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Club.objects.all()
    serializer_class = ClubSerializer


# ORGANIZER CREATES CLUB
class ClubCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "ADMIN":
            return Response({"detail": "Only admin can create clubs"}, status=403)

        serializer = ClubSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Club created successfully"}, status=201)


# ADMIN APPROVES CLUB
class ApproveClubView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, club_id):
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admin can approve clubs"},
                status=403
            )

        club = get_object_or_404(Club, id=club_id)
        club.approved = True
        club.save()

        return Response({"message": "Club approved successfully"})