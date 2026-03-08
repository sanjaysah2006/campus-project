from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from django.db.models import Count
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status

from openpyxl import Workbook

from .models import Event, EventInteraction, EventRegistration
from .serializers import EventCreateSerializer
from clubs.models import Club
from users.models import StudentProfile


# ============================================
# CREATE EVENT (ORGANIZER ONLY)
# ============================================
class EventCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "ORGANIZER":
            return Response(
                {"detail": "Only organizers can create events"},
                status=403
            )

        # 🔥 Find organizer's club
        try:
            club = Club.objects.get(organizer=request.user)
        except Club.DoesNotExist:
            return Response(
                {"detail": "No club assigned to this organizer"},
                status=400
            )

        serializer = EventCreateSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(club=club)  # 🔥 Auto assign club
            return Response(
                {"message": "Event created successfully"},
                status=201
            )

        return Response(serializer.errors, status=400)


# ============================================
# STUDENT FEED
# ============================================
class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "STUDENT":
            return Response({"detail": "Access denied"}, status=403)

        events = Event.objects.filter(approved=True)
        serializer = EventCreateSerializer(events, many=True)
        return Response(serializer.data)

# =====================================================
# EVENT REGISTER (STUDENT ONLY)
# =====================================================
class EventRegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):

        if request.user.role != "STUDENT":
            return Response({"detail": "Only students can register"}, status=403)

        event = get_object_or_404(Event, id=event_id, approved=True)

        registration, created = EventRegistration.objects.get_or_create(
            student=request.user,
            event=event
        )

        if not created:
            return Response({"message": "Already registered"}, status=200)

        return Response({"message": "Successfully registered"}, status=201)


# =====================================================
# EVENT RECOMMENDATION (STUDENT ONLY)
# =====================================================
class EventRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "STUDENT":
            return Response({"detail": "Only students allowed"}, status=403)

        top_category = (
            EventInteraction.objects
            .filter(student=request.user)
            .values("event__category")
            .annotate(count=Count("id"))
            .order_by("-count")
            .first()
        )

        if not top_category:
            return Response([])

        registered_event_ids = EventRegistration.objects.filter(
            student=request.user
        ).values_list("event_id", flat=True)

        events = Event.objects.filter(
            approved=True,
            category=top_category["event__category"],
            end_datetime__gte=now()
        ).exclude(id__in=registered_event_ids)

        data = [{
            "id": e.id,
            "title": e.title,
            "category": e.category,
            "club": e.club.name
        } for e in events]

        return Response(data)


# =====================================================
# ADMIN APPROVE EVENT
# =====================================================
class AdminApproveEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        if request.user.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        event = get_object_or_404(Event, id=event_id)
        event.approved = True
        event.save()

        return Response({"message": "Event approved successfully"})

class AdminAllEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        events = Event.objects.all().order_by("-created_at")

        data = [{
            "id": e.id,
            "title": e.title,
            "category": e.category,
            "club": e.club.name,
            "approved": e.approved,
            "start_datetime": e.start_datetime,
        } for e in events]

        return Response(data)
# =====================================================
# ADMIN PENDING EVENTS
# =====================================================
class AdminPendingEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 🔥 Custom role check
        if request.user.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        events = Event.objects.filter(approved=False)

        data = [{
            "id": e.id,
            "title": e.title,
            "category": e.category,
            "club": e.club.name,
            "start_datetime": e.start_datetime,
        } for e in events]

        return Response(data)


# =====================================================
# ADMIN DASHBOARD STATS
# =====================================================
class AdminDashboardStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        data = {
            "total_clubs": Club.objects.count(),
            "pending_clubs": Club.objects.filter(approved=False).count(),
            "total_events": Event.objects.count(),
            "pending_events": Event.objects.filter(approved=False).count(),
            "active_events": Event.objects.filter(
                approved=True,
                end_datetime__gte=now()
            ).count(),
            "total_registrations": EventRegistration.objects.count(),
        }

        return Response(data)
    
class EventViewTrack(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):

        if request.user.role != "STUDENT":
            return Response(
                {"detail": "Only students can view events"},
                status=403
            )

        event = get_object_or_404(Event, id=event_id)

        EventInteraction.objects.create(
            student=request.user,
            event=event,
            interaction_type="VIEW"
        )

        return Response(
            {"message": "Event view recorded"},
            status=200
        )
    

class OrganizerEventHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "ORGANIZER":
            return Response({"detail": "Access denied"}, status=403)

        events = Event.objects.filter(club__organizer=request.user)
        serializer = EventCreateSerializer(events, many=True)
        return Response(serializer.data)
    
class EventDetailView(APIView):
    permission_classes = [IsAuthenticated]
    queryset = Event.objects.all()
    serializer_class = EventCreateSerializer

    def get(self, request, event_id):
        event = get_object_or_404(Event, id=event_id)
        
        data = {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "category": event.category,
            "venue": event.venue,
            "start_datetime": event.start_datetime,
            "end_datetime": event.end_datetime,
            "approved": event.approved,
            "club": {
                "id": event.club.id,
                "name": event.club.name
            }
        }

        return Response(data)
