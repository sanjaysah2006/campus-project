from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from django.db.models import Count
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from openpyxl import Workbook
from openpyxl.styles import Font

from .models import Event, EventInteraction, EventRegistration
from .serializers import EventSerializer, EventCreateSerializer
from clubs.models import Club


# ================================
# CREATE EVENT (ORGANIZER ONLY)
# ================================
class CreateEventView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # ✅ important for image

    def post(self, request):

        # ✅ role check
        if request.user.role != "ORGANIZER":
            return Response(
                {"detail": "Only organizers allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        # ✅ get club of organizer
        try:
            club = Club.objects.get(organizer=request.user)
        except Club.DoesNotExist:
            return Response(
                {"error": "You are not assigned to any club"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ serializer
        serializer = EventCreateSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(
                organizer=request.user,
                club=club,
                approved=False
            )
            return Response(
                {
                    "message": "Event created successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        # 🔥 DEBUG (keep for now)
        print("ERROR:", serializer.errors)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ================================
# LIST EVENTS (APPROVED ONLY)
# ================================
class EventListView(APIView):

    def get(self, request):
        events = Event.objects.select_related("club", "organizer")\
            .filter(approved=True)\
            .order_by("-date")

        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# ================================
# EVENT DETAIL
# ================================
class EventDetailView(APIView):

    def get(self, request, pk):

        event = get_object_or_404(Event, id=pk, approved=True)

        serializer = EventSerializer(
            event,  # ✅ FIXED (no many=True)
            context={"request": request}
        )

        return Response(serializer.data)


# ================================
# STUDENT DASHBOARD
# ================================
class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "STUDENT":
            return Response({"detail": "Access denied"}, status=403)

        events = Event.objects.select_related("club", "organizer")\
            .filter(approved=True)\
            .order_by("-date")

        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# ================================
# EVENT REGISTER
# ================================
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
            return Response(
                {"message": "Already registered"},
                status=400
            )

        return Response(
            {"message": "Successfully registered"},
            status=201
        )


# ================================
# ADMIN APPROVE EVENT
# ================================
class ApproveEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):

        if request.user.role != "ADMIN":
            return Response({"detail": "Only admin can approve"}, status=403)

        event = get_object_or_404(Event, id=event_id)

        event.approved = True
        event.save()

        return Response({"message": "Event approved successfully"})


# ================================
# ADMIN ALL EVENTS
# ================================
class AdminAllEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        events = Event.objects.select_related("club", "organizer")\
            .all().order_by("-created_at")

        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# ================================
# ADMIN PENDING EVENTS
# ================================
class AdminPendingEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        events = Event.objects.select_related("club", "organizer")\
            .filter(approved=False)

        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# ================================
# ADMIN DASHBOARD
# ================================
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
                date__gte=now()
            ).count(),
            "total_registrations": EventRegistration.objects.count(),
        }

        return Response(data)


# ================================
# EVENT VIEW TRACK
# ================================
class EventViewTrack(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):

        if request.user.role != "STUDENT":
            return Response({"detail": "Only students allowed"}, status=403)

        event = get_object_or_404(Event, id=event_id)

        EventInteraction.objects.create(
            student=request.user,
            event=event,
            interaction_type="VIEW"
        )

        return Response({"message": "View recorded"})


# ================================
# ORGANIZER EVENT HISTORY
# ================================
class OrganizerEventHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ORGANIZER":
            return Response({"detail": "Access denied"}, status=403)

        events = Event.objects.select_related("club", "organizer")\
            .filter(club__organizer=request.user)

        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# ================================
# EXPORT EVENT REGISTRATIONS (EXCEL)
# ================================
class ExportEventRegistrationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):

        event = get_object_or_404(Event, id=event_id)

        if request.user.role == "ORGANIZER" and event.club.organizer != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        if request.user.role not in ["ADMIN", "ORGANIZER"]:
            return Response({"detail": "Not allowed"}, status=403)

        registrations = EventRegistration.objects.filter(
            event=event
        ).select_related("student", "student__student_profile")

        wb = Workbook()
        ws = wb.active
        ws.title = "Registrations"

        ws.append([f"Event: {event.title}"])
        ws.append([])

        ws.append([
            "Name", "Roll No", "Course", "Batch",
            "Semester", "Section", "Phone",
            "Email", "Registered At"
        ])

        for cell in ws[3]:
            cell.font = Font(bold=True)

        for reg in registrations:
            student = reg.student
            profile = getattr(student, "student_profile", None)

            ws.append([
                profile.name if profile else "",
                profile.roll_no if profile else "",
                profile.course if profile else "",
                profile.batch if profile else "",
                profile.semester if profile else "",
                profile.section if profile else "",
                profile.phone if profile else "",
                student.email,
                reg.registered_at.strftime("%Y-%m-%d %H:%M"),
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        response["Content-Disposition"] = (
            f'attachment; filename="event_{event.id}_registrations.xlsx"'
        )

        wb.save(response)
        return response