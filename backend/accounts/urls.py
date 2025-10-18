from django.urls import path
from .views import RegisterView, SendOTPView, VerifyOTPView, PasswordResetView, LoginView
from .views import MeView
from .views import dev_latest_otp

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('send_otp/', SendOTPView.as_view(), name='send_otp'),
    path('verify_otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('password_reset/', PasswordResetView.as_view(), name='password_reset'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('me/', MeView.as_view(), name='me'),
    path('dev_latest_otp/', dev_latest_otp, name='dev_latest_otp'),
]
