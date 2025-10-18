from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import OTPRequest
from django.utils import timezone
from datetime import timedelta
import random
from django.core.mail import send_mail
import os
import logging

logger = logging.getLogger(__name__)


User = get_user_model()


def normalize_identifier(identifier: str) -> str:
    """Trim whitespace and normalize emails to lowercase."""
    if identifier is None:
        return identifier
    ident = identifier.strip()
    if '@' in ident:
        ident = ident.lower()
    return ident


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)

    def create(self, validated_data):
        user = User.objects.create_user(username=validated_data['username'], password=validated_data['password'], email=validated_data.get('email'))
        return user

    def validate(self, data):
        # validate unique username/email early to return a friendly error
        username = data.get('username')
        email = data.get('email')
        errors = {}
        if username and User.objects.filter(username=username).exists():
            errors['username'] = 'This username is already taken.'
        if email and User.objects.filter(email=email).exists():
            errors['email'] = 'This email is already used.'
        if errors:
            raise serializers.ValidationError(errors)
        return data


class OTPSendSerializer(serializers.Serializer):
    identifier = serializers.CharField()  # phone or email

    def create_otp(self):
        identifier = normalize_identifier(self.validated_data.get('identifier'))
        code = f"{random.randint(100000,999999)}"
        expires = timezone.now() + timedelta(minutes=10)
        # expire any previous unused OTPs for this identifier to avoid reuse/confusion
        # prefer setting expires_at to now rather than flipping `used` so history remains clear
        OTPRequest.objects.filter(identifier=identifier, used=False).update(expires_at=timezone.now())
        otp = OTPRequest.objects.create(identifier=identifier, code=code, expires_at=expires)
        # helpful debug print (visible in container logs)
        print(f"[otp] Created OTP {code} for {otp.identifier} id={otp.id} expires={expires.isoformat()}")
        identifier = otp.identifier
        # If identifier looks like an email, send via configured SMTP (MailHog in docker-compose)
        if '@' in identifier:
            subject = os.getenv('OTP_EMAIL_SUBJECT', 'Your FASTFOOD OTP')
            message = f"Your verification code is: {code}\nThis code expires in 10 minutes."
            from_email = os.getenv('DEFAULT_FROM_EMAIL', 'no-reply@fastfood.local')
            try:
                send_mail(subject, message, from_email, [identifier])
            except Exception:
                # fallback to printing for debugging
                print(f"[maihog] Failed to send email via SMTP, fallback print OTP {code} to {identifier}")
        else:
            # for phone numbers or other identifiers we just print (or integrate SMS later)
            print(f"[maihog] Sending OTP {code} to {otp.identifier}")
        return otp


class OTPVerifySerializer(serializers.Serializer):
    identifier = serializers.CharField()
    code = serializers.CharField()

    def validate(self, data):
        # normalize identifier the same way we do when creating OTPs
        identifier = normalize_identifier(data.get('identifier'))
        data['identifier'] = identifier
        try:
            otp = OTPRequest.objects.filter(identifier=identifier, code=data['code'], used=False).latest('created_at')
        except OTPRequest.DoesNotExist:
            logger.debug('OTP verify failed: no matching OTP for identifier=%s code=%s', identifier, data.get('code'))
            raise serializers.ValidationError('Invalid code')
        if not otp.is_valid():
            logger.debug('OTP verify failed: otp exists but invalid (used=%s expires_at=%s) id=%s', otp.used, otp.expires_at.isoformat(), otp.id)
            raise serializers.ValidationError('Code expired or used')
        data['otp_obj'] = otp
        return data


class PasswordResetSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    code = serializers.CharField()
    new_password = serializers.CharField()


class ProfileSerializer(serializers.Serializer):
    username = serializers.CharField(source='user.username')
    role = serializers.CharField()

