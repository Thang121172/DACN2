from django.urls import path, include
from rest_framework.routers import DefaultRouter
from orders.views import OrderViewSet, MerchantViewSet, ShipperViewSet

router = DefaultRouter()
router.register(r'orders',   OrderViewSet,   basename='order')
router.register(r'merchant', MerchantViewSet, basename='merchant')
router.register(r'shipper',  ShipperViewSet,  basename='shipper')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/accounts/', include('accounts.urls')),
]
