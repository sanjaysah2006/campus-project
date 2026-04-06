from rest_framework import serializers
from .models import Event


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "title",
            "description",
            "club",
            "organizer",
            "date",
            "location",
            "image",
        ]


from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()
    registrations = serializers.SerializerMethodField()
    club_name = serializers.CharField(source="club.name", read_only=True)
    organizer_name = serializers.CharField(source="organizer.username", read_only=True)

    def get_image(self, obj):
        if obj.image:
            try:
                return obj.image.url
            except:
                return None
        return None

    def get_registrations(self, obj):
        return obj.registrations.count()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "club",
            "club_name",
            "organizer",
            "organizer_name",
            "date",
            "location",
            "image",
            "approved",
            "created_at",
            "registrations",
        ]  

