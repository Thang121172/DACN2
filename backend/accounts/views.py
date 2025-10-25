from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer, RegisterMerchantSerializer
from menus.models import Merchant

User = get_user_model()

class RegisterView(APIView):
    """Đăng ký không OTP: tạo user is_active=True, trả JWT (nếu có)."""
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

        user = s.create(s.validated_data)
        user.is_active = True
        user.save(update_fields=['is_active'])

        payload = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'activated': True,
        }
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            payload.update({'access': str(refresh.access_token), 'refresh': str(refresh)})
        except Exception:
            pass
        return Response(payload, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """ /api/accounts/login/ → access/refresh """
    pass


class MeView(APIView):
    """ /api/accounts/me/ → thông tin user + role từ Profile """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(getattr(user, 'profile', None), 'role', 'customer')
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role,
        }, status=200)


class RegisterMerchantView(APIView):
    """
    POST /api/accounts/register_merchant/
    - Nếu chưa login: {username,password,email?, name,address?,phone?}
    - Nếu đã login:   {name,address?,phone?}
    Trả user + merchant (+ JWT nếu dùng SimpleJWT)
    """
    def post(self, request):
        ser = RegisterMerchantSerializer(data=request.data, context={"request": request})
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        user, merchant = ser.save()
        payload = {
            "user": {
                "id": user.id, "username": user.username, "email": user.email,
                "role": getattr(getattr(user, "profile", None), "role", "customer")
            },
            "merchant": {"id": merchant.id, "name": merchant.name},
        }
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            payload.update({"access": str(refresh.access_token), "refresh": str(refresh)})
        except Exception:
            pass
        return Response(payload, status=201)


class MyMerchantsView(APIView):
    """ GET /api/accounts/my_merchants/ """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Merchant.objects.filter(members__user=request.user).distinct()
        return Response([{"id": m.id, "name": m.name} for m in qs], status=200)
