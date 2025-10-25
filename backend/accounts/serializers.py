from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from menus.models import Merchant, MerchantMember
from .models import Profile

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email    = serializers.EmailField(required=False, allow_blank=True)
    phone    = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        username = data.get('username', '').strip()
        email    = (data.get('email') or '').strip().lower()

        errors = {}
        if username and User.objects.filter(username__iexact=username).exists():
            errors['username'] = 'This username is already taken.'
        if email and User.objects.filter(email__iexact=email).exists():
            errors['email'] = 'This email is already used.'
        if errors:
            raise serializers.ValidationError(errors)
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email') or ''
        )
        # đảm bảo có Profile
        Profile.objects.get_or_create(user=user)
        return user


class RegisterMerchantSerializer(serializers.Serializer):
    # Nếu chưa đăng nhập → cần các field user
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email    = serializers.EmailField(required=False, allow_blank=True)

    # Thông tin cửa hàng
    name     = serializers.CharField()
    address  = serializers.CharField(required=False, allow_blank=True)
    phone    = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        req = self.context.get("request")
        u = req.user if req else None
        if not u or not u.is_authenticated:
            if not data.get("username") or not data.get("password"):
                raise serializers.ValidationError({"detail": "username & password required for new user"})
            if User.objects.filter(username__iexact=data["username"]).exists():
                raise serializers.ValidationError({"username": "taken"})
            email = (data.get("email") or "").strip().lower()
            if email and User.objects.filter(email__iexact=email).exists():
                raise serializers.ValidationError({"email": "used"})
        return data

    @transaction.atomic
    def create(self, validated):
        req = self.context.get("request")
        current_user = req.user if req and req.user.is_authenticated else None

        if current_user:
            user = current_user
        else:
            user = User.objects.create_user(
                username=validated["username"],
                password=validated["password"],
                email=(validated.get("email") or "").strip().lower(),
                is_active=True,
            )

        profile, _ = Profile.objects.get_or_create(user=user)
        if profile.role != "merchant":
            profile.role = "merchant"
            profile.save(update_fields=["role"])

        merchant = Merchant.objects.create(
            owner=user,
            name=validated["name"],
            address=validated.get("address", ""),
            phone=validated.get("phone", ""),
        )
        MerchantMember.objects.create(user=user, merchant=merchant, role="owner")
        return user, merchant
