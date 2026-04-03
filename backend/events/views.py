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
from .serializers import EventSerializer
from clubs.models import Club


# ================================
# CREATE EVENT (ORGANIZER ONLY)
# ================================

class CreateEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        # 🔥 AUTO ASSIGN CLUB (IMPORTANT)
        try:
            club = Club.objects.get(organizer=user)
        except Club.DoesNotExist:
            return Response(
                {"error": "You are not assigned to any club"},
                status=status.HTTP_400_BAD_REQUEST
            )

        event = Event.objects.create(
            title=request.data.get("title"),
            description=request.data.get("description"),
            date=request.data.get("date"),
            location=request.data.get("location"),
            club=club,
            organizer=user,
            image=request.FILES.get("image"),
            approved=False
        )

        return Response(
            {"message": "Event created successfully"},
            status=status.HTTP_201_CREATED
        )


# ================================
# LIST EVENTS (APPROVED ONLY)
# ================================

class EventListView(APIView):

    def get(self, request):

        events = Event.objects.filter(approved=True).order_by("-date")

        serializer = EventSerializer(events, many=True, context={"request": request})

        return Response(serializer.data)



# =====================================================
# STUDENT DASHBOARD
# =====================================================
class StudentDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "STUDENT":
            return Response({"detail": "Access denied"}, status=403)

        events = Event.objects.select_related("club").filter(
            approved=True
        )

        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# =====================================================
# EVENT REGISTER
# =====================================================
class EventRegisterView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):

        if request.user.role != "STUDENT":
            return Response(
                {"detail": "Only students can register"},
                status=403
            )

        event = get_object_or_404(Event, id=event_id, approved=True)

        registration, created = EventRegistration.objects.get_or_create(
            student=request.user,
            event=event
        )

        if not created:
            return Response({"message": "Already registered"}, status=200)

        return Response({"message": "Successfully registered"}, status=201)


# =====================================================
# EVENT RECOMMENDATION
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

        registered_ids = EventRegistration.objects.filter(
            student=request.user
        ).values_list("event_id", flat=True)

        events = Event.objects.filter(
            approved=True,
            category=top_category["event__category"],
            date__gte=now()
        ).exclude(id__in=registered_ids)

        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# ================================
# ADMIN APPROVE EVENT
# ================================

class ApproveEventView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):

        if request.user.role != "ADMIN":

            return Response(
                {"detail": "Only admin can approve"},
                status=403
            )

        event = get_object_or_404(Event, id=event_id)

        event.approved = True
        event.save()

        return Response({
            "message": "Event approved successfully"
        })


# =====================================================
# ADMIN ALL EVENTS
# =====================================================
class AdminAllEventsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        events = Event.objects.select_related("club").all().order_by("-created_at")

        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# =====================================================
# ADMIN PENDING EVENTS
# =====================================================
class AdminPendingEventsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        events = Event.objects.select_related("club").filter(approved=False)

        serializer = EventSerializer(
            events,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# =====================================================
# ADMIN DASHBOARD
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
                date__gte=now()
            ).count(),
            "total_registrations": EventRegistration.objects.count(),
        }

        return Response(data)


# =====================================================
# EVENT VIEW TRACK
# =====================================================
class EventViewTrack(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):

        if request.user.role != "STUDENT":
            return Response({"detail": "Only students can view events"}, status=403)

        event = get_object_or_404(Event, id=event_id)

        EventInteraction.objects.create(
            student=request.user,
            event=event,
            interaction_type="VIEW"
        )

        return Response({"message": "Event view recorded"})


# =====================================================
# ORGANIZER EVENT HISTORY
# =====================================================
class OrganizerEventHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ORGANIZER":
            return Response({"detail": "Access denied"}, status=403)

        events = Event.objects.select_related("club").filter(
            club__organizer=request.user
        )

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

        serializer = EventSerializer(event,many=True, context={"request": request})

        return Response(serializer.data)


from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from openpyxl import Workbook

from .models import Event, EventRegistration


# =====================================================
# EXPORT EVENT REGISTRATIONS (EXCEL)
# =====================================================
class ExportEventRegistrationsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):

        # ✅ FIRST: GET EVENT
        event = get_object_or_404(Event, id=event_id)

        # ✅ PERMISSION CHECK (CLEAN)
        if request.user.role == "ORGANIZER" and event.club.organizer != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        if request.user.role not in ["ADMIN", "ORGANIZER"]:
            return Response({"detail": "Not allowed"}, status=403)

        # ✅ FETCH DATA
        registrations = EventRegistration.objects.filter(
            event=event
        ).select_related("student", "student__student_profile")

        # ✅ EXCEL
        wb = Workbook()
        ws = wb.active
        ws.title = "Registrations"

        # ✅ EVENT TITLE
        ws.append([f"Event: {event.title}"])
        ws.append([])

        # ✅ HEADERS
        ws.append([
            "Name",
            "Roll No",
            "Course",
            "Batch",
            "Semester",
            "Section",
            "Phone",
            "Email",
            "Registered At"
        ])
        for cell in ws[3]:
            cell.font = Font(bold=True)

            
        # ✅ DATA
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

        # ✅ AUTO WIDTH
        for col in ws.columns:
            max_length = 0
            col_letter = col[0].column_letter

            for cell in col:
                try:
                    if cell.value:
                        max_length = max(max_length, len(str(cell.value)))
                except:
                    pass

            ws.column_dimensions[col_letter].width = max_length + 2

        # ✅ RESPONSE
        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        response["Content-Disposition"] = (
            f'attachment; filename="event_{event.id}_registrations.xlsx"'
        )

        wb.save(response)
        return response