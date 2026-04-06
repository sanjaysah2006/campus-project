from rest_framework import serializers
from .models import Club
from users.models import User


class ClubCreateSerializer(serializers.ModelSerializer):

    organizer_id = serializers.IntegerField(required=False)

    class Meta:
        model = Club
        fields = [
            "id",
            "name",
            "description",
            "category",
            "image",
            "organizer_id"
        ]

    def create(self, validated_data):

        organizer_id = validated_data.pop("organizer_id", None)

        club = Club.objects.create(**validated_data)

        if organizer_id:

            try:

                user = User.objects.get(id=organizer_id)

                user.role = "ORGANIZER"
                user.club = club
                user.save()

                club.organizer = user
                club.save()

            except User.DoesNotExist:
                pass

        return club


class ClubSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()

    organizer        = serializers.SerializerMethodField()
    organizer_name   = serializers.SerializerMethodField()
    organizer_email  = serializers.SerializerMethodField()
    organizer_phone  = serializers.SerializerMethodField()
    organizer_rollno = serializers.SerializerMethodField()

    def get_image(self, obj):
        if obj.image:
            try:
                return obj.image.url
            except:
                return None
        return None

    def _get_profile(self, obj):
        try:
            return obj.organizer.student_profile if obj.organizer else None
        except:
            return None

    def get_organizer(self, obj):
        return obj.organizer.id if obj.organizer else None

    def get_organizer_name(self, obj):
        profile = self._get_profile(obj)
        if profile and profile.name:
            return profile.name

        if obj.organizer:
            full_name = obj.organizer.get_full_name()
            return full_name.strip() if full_name.strip() else obj.organizer.username

        return None

    def get_organizer_email(self, obj):
        return obj.organizer.email if obj.organizer else None

    def get_organizer_phone(self, obj):
        profile = self._get_profile(obj)
        return profile.phone if profile else None

    def get_organizer_rollno(self, obj):
        profile = self._get_profile(obj)
        return profile.roll_no if profile else (
            obj.organizer.username if obj.organizer else None
        )

    class Meta:
        model = Club
        fields = [
            "id",
            "name",
            "description",
            "category",
            "image",
            "approved",
            "created_at",
            "organizer",
            "organizer_name",
            "organizer_email",
            "organizer_phone",
            "organizer_rollno",
        ]