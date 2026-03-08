from rest_framework import serializers
from .models import Event
from .utils import is_event_conflicting


class EventCreateSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source="club.name", read_only=True)
    class Meta:
        model = Event
        fields = "__all__"

    def validate(self, data):

        if data['start_datetime'] >= data['end_datetime']:
            raise serializers.ValidationError(
                "End time must be after start time."
            )

        return data