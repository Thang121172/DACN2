from django.urls import path
from .views import RegisterView, LoginView, MeView, RegisterMerchantView, MyMerchantsView

urlpatterns = [
    path('register/',          RegisterView.as_view(),         name='register'),
    path('login/',             LoginView.as_view(),            name='token_obtain_pair'),
    path('me/',                MeView.as_view(),               name='me'),

    # mới:
    path('register_merchant/', RegisterMerchantView.as_view(), name='register-merchant'),
    path('my_merchants/',      MyMerchantsView.as_view(),      name='my-merchants'),
]
