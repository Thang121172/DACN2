from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, OTPSendSerializer, OTPVerifySerializer, PasswordResetSerializer
from django.contrib.auth import get_user_model
from .models import OTPRequest
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from .serializers import ProfileSerializer
from django.db import IntegrityError
from django.conf import settings
from django.http import JsonResponse


User = get_user_model()


class RegisterView(APIView):
    def post(self, request):
        s = RegisterSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = s.create(s.validated_data)
        except IntegrityError as e:
            return Response({'detail': 'Username or email already exists.'}, status=400)
        return Response({'id': user.id, 'username': user.username})


class SendOTPView(APIView):
    def post(self, request):
        s = OTPSendSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        otp = s.create_otp()
        # In dev show the code in the response to ease testing
        from django.conf import settings
        resp = {'otp_id': str(otp.id)}
        if getattr(settings, 'DEBUG', False):
            resp['code'] = otp.code
        return Response(resp)


class VerifyOTPView(APIView):
    def post(self, request):
        # Debug-friendly verify: log incoming data and return fielded errors for easier troubleshooting in dev
        try:
            # request.data may raise a ParseError if the client sent invalid JSON
            incoming = request.data
            print(f"[verify] incoming data: {incoming}")
        except Exception as parse_err:
            # print raw body for debugging and return a helpful JSON error
            try:
                raw = request.body.decode('utf-8') if request.body else ''
            except Exception:
                raw = repr(request.body)[:1000]
            print(f"[verify] JSON parse error: {parse_err}; raw body={raw}")
            return Response({'detail': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

        s = OTPVerifySerializer(data=incoming)
        try:
            s.is_valid(raise_exception=True)
        except Exception as e:
            # serializer raised ValidationError or other exception — print details and re-raise as a 400 with message
            try:
                # DRF ValidationError carries .detail
                detail = getattr(e, 'detail', str(e))
            except Exception:
                detail = str(e)
            print(f"[verify] validation failed: {detail}")
            return Response({'detail': detail}, status=status.HTTP_400_BAD_REQUEST)
        otp = s.validated_data['otp_obj']
        otp.mark_used()
        print(f"[verify] success: otp id={otp.id} for identifier={otp.identifier}")
        return Response({'ok': True})


class PasswordResetView(APIView):
    def post(self, request):
        s = PasswordResetSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
        # validate otp
        identifier = s.validated_data['identifier']
        # normalize identifier
        identifier = identifier.strip().lower() if '@' in identifier else identifier.strip()
        s.validated_data['identifier'] = identifier
        code = s.validated_data['code']
        try:
            otp = OTPRequest.objects.filter(identifier=identifier, code=code, used=False).latest('created_at')
        except OTPRequest.DoesNotExist:
            return Response({'detail': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
        if not otp.is_valid():
            return Response({'detail': 'Expired'}, status=status.HTTP_400_BAD_REQUEST)
        # find user by identifier
        try:
            user = User.objects.get(email=identifier)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        user.set_password(s.validated_data['new_password'])
        user.save()
        otp.mark_used()
        return Response({'ok': True})


class LoginView(TokenObtainPairView):
    pass


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        role = profile.role if profile else 'customer'
        return Response({'username': user.username, 'role': role})


def dev_latest_otp(request):
    """Dev-only helper: return the latest OTP for a given identifier (query param `identifier`) when DEBUG=True."""
    if not getattr(settings, 'DEBUG', False):
        return JsonResponse({'detail': 'Not available'}, status=404)
    identifier = request.GET.get('identifier')
    # normalize like the serializer
    if identifier:
        identifier = identifier.strip().lower() if '@' in identifier else identifier.strip()
    if not identifier:
        return JsonResponse({'detail': 'identifier required'}, status=400)
    otp = OTPRequest.objects.filter(identifier=identifier).order_by('-created_at').first()
    if not otp:
        return JsonResponse({'detail': 'not found'}, status=404)
    return JsonResponse({'id': str(otp.id), 'code': otp.code, 'created_at': otp.created_at.isoformat(), 'expires_at': otp.expires_at.isoformat(), 'used': otp.used})

