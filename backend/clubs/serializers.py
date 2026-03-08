from rest_framework import serializers
from .models import Club


class ClubCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = ['id', 'name', 'description']

    def create(self, validated_data):
        user = self.context['request'].user

        return Club.objects.create(
            coordinator=user,
            approved=False,
            **validated_data
        )


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = "__all__"