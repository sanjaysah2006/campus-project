from rest_framework import serializers
from .models import User, StudentProfile
from datetime import datetime


# -------------------------------
# 🔐 STUDENT REGISTRATION SERIALIZER
# -------------------------------
class StudentRegisterSerializer(serializers.Serializer):

    name = serializers.CharField()
    roll_no = serializers.CharField()
    section = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    # for upload
    id_card = serializers.ImageField(required=False)

    # -------------------------------
    # VALIDATION
    # -------------------------------
    def validate_roll_no(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Student with this roll number already exists."
            )
        return value

    def validate_id_card(self, value):
        # optional: file size limit (2MB)
        if value and value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("File too large (max 2MB)")
        return value

    # -------------------------------
    # HELPER FUNCTIONS
    # -------------------------------
    def get_batch(self, roll):

        if roll.startswith("1123"):
            return "2023-27"

        if roll.startswith("1122"):
            return "2022-26"

        if roll.startswith("1124"):
            return "2024-28"

        return "Unknown"

    def calculate_semester(self, batch):

        if batch == "Unknown":
            return 1

        year = int(batch.split("-")[0])
        current_year = datetime.now().year

        semester = (current_year - year) * 2 + 1

        return max(1, min(semester, 8))

    # -------------------------------
    # CREATE USER + PROFILE
    # -------------------------------
    def create(self, validated_data):

        name = validated_data["name"]
        roll = validated_data["roll_no"]

        batch = self.get_batch(roll)
        semester = self.calculate_semester(batch)

        # create user
        user = User.objects.create_user(
            username=roll,
            email=validated_data["email"],
            password=validated_data["password"],
            role="STUDENT",
            first_name=name
        )

        # create profile (Cloudinary handles image automatically)
        StudentProfile.objects.create(
            user=user,
            name=name,
            roll_no=roll,
            course="B.Tech CSE",
            batch=batch,
            semester=semester,
            section=validated_data["section"],
            phone=validated_data["phone"],
            id_card=validated_data.get("id_card")  # ✅ Cloudinary upload
        )

        return user


# -------------------------------
# 📦 STUDENT PROFILE SERIALIZER (FOR RESPONSE)
# -------------------------------
class StudentProfileSerializer(serializers.ModelSerializer):

    id_card = serializers.SerializerMethodField()

    def get_id_card(self, obj):
        if obj.id_card:
            try:
                return obj.id_card.url  # ✅ Cloudinary URL
            except:
                return None
        return None

    class Meta:
        model = StudentProfile
        fields = "__all__"