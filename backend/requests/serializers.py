# requests/serializers.py

from rest_framework import serializers
from .models import AssistanceRequest


class AssistanceRequestSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source="club.name", read_only=True)
    requester_name = serializers.CharField(source="requester.username", read_only=True)

    class Meta:
        model = AssistanceRequest
        fields = "__all__"