from rest_framework import serializers
from .models import Event


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "title",
            "description",
            "category",
            "poster",
            "venue",
            "start_datetime",
            "end_datetime",
        ]


class EventSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    registrations = serializers.SerializerMethodField()
    club_name = serializers.CharField(source="club.name", read_only=True)

    def get_image(self, obj):
        request = self.context.get("request")

        if obj.image and request:
            url = obj.image.url

            # 🔥 force ngrok domain
            host = request.get_host()
            scheme = request.scheme

            return f"{scheme}://{host}{url}"

        return None

    def get_registrations(self, obj):
        return obj.registrations.count()

    class Meta:
        model = Event
        fields = "__all__"   

