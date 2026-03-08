from rest_framework import serializers
from .models import User, StudentProfile


# =====================================================
# 1️⃣ GENERIC REGISTER SERIALIZER (STUDENT / ORGANIZER)
# =====================================================
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['STUDENT', 'ORGANIZER'])

    # Student-only fields
    roll_no = serializers.CharField(required=False)
    semester = serializers.IntegerField(required=False)
    section = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)

    def validate(self, data):
        if data['role'] == 'STUDENT':
            required_fields = ['roll_no', 'semester', 'section', 'phone']
            for field in required_fields:
                if field not in data:
                    raise serializers.ValidationError(
                        f"{field} is required for student registration"
                    )
        return data

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')

        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            password=password,
            role=role
        )

        # Create student profile if student
        if role == 'STUDENT':
            StudentProfile.objects.create(
                user=user,
                roll_no=validated_data.get('roll_no'),
                semester=validated_data.get('semester'),
                section=validated_data.get('section'),
                phone=validated_data.get('phone'),
            )

        return user


# =====================================================
# 2️⃣ DEDICATED STUDENT REGISTER SERIALIZER (RECOMMENDED)
# =====================================================
class StudentRegisterSerializer(serializers.ModelSerializer):
    roll_no = serializers.CharField()
    semester = serializers.IntegerField()
    section = serializers.CharField()
    phone = serializers.CharField()

    class Meta:
        model = User
        fields = [
            'username', 'password',
            'first_name', 'last_name',
            'email',
            'roll_no', 'semester',
            'section', 'phone'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # 🔹 Extract profile fields first
        roll_no = validated_data.pop('roll_no')
        semester = validated_data.pop('semester')
        section = validated_data.pop('section')
        phone = validated_data.pop('phone')

        # 🔹 Create user
        user = User.objects.create_user(
            role='STUDENT',
            **validated_data
        )

        # 🔹 Create student profile
        StudentProfile.objects.create(
            user=user,
            roll_no=roll_no,
            semester=semester,
            section=section,
            phone=phone
        )

        return user
