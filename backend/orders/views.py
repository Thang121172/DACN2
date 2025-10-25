from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.timezone import now
from .models import Order
from .serializers import OrderSerializer
from menus.models import MenuItem


# ============================================================
# 1️⃣ ORDER VIEWSET
# ============================================================
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=True, methods=['post'])
    def set_status(self, request, pk=None):
        """
        Đổi trạng thái đơn hàng: /api/orders/{id}/set_status/
        Body: { "status": "delivered" }
        """
        order = self.get_object()
        status_val = request.data.get('status')
        if not status_val:
            return Response({'detail': 'status required'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = status_val
        order.save()
        return Response({'status': order.status})


# ============================================================
# 2️⃣ MERCHANT VIEWSET
# ============================================================
class MerchantViewSet(viewsets.ViewSet):
    """
    Endpoint cơ bản cho merchant để quản lý stock món ăn
    /api/merchant/ -> danh sách món
    /api/merchant/{id}/update_stock/ -> cập nhật tồn kho
    """

    def list(self, request):
        qs = MenuItem.objects.all()
        data = [
            {
                'id': m.id,
                'name': m.name,
                'price': str(m.price),
                'stock': m.stock,
                'merchant_id': m.merchant_id,
            }
            for m in qs
        ]
        return Response(data)

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        try:
            menu = MenuItem.objects.get(pk=pk)
        except MenuItem.DoesNotExist:
            return Response({'detail': 'not found'}, status=status.HTTP_404_NOT_FOUND)
        new_stock = int(request.data.get('stock', menu.stock))
        menu.stock = new_stock
        menu.save()
        return Response({'id': menu.id, 'stock': menu.stock})


# ============================================================
# 3️⃣ SHIPPER VIEWSET
# ============================================================
class ShipperViewSet(viewsets.ViewSet):
    """
    Endpoint cho shipper để lấy danh sách đơn hàng chưa giao
    và cập nhật trạng thái khi nhận hàng
    """

    def list(self, request):
        qs = Order.objects.exclude(status='delivered')
        data = [
            {
                'id': o.id,
                'status': o.status,
                'created_at': o.created_at.isoformat(),
            }
            for o in qs
        ]
        return Response(data)

    @action(detail=True, methods=['post'])
    def pickup(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'not found'}, status=status.HTTP_404_NOT_FOUND)
        order.status = 'on_the_way'
        order.save()
        return Response({'id': order.id, 'status': order.status})


# ============================================================
# 4️⃣ MERCHANT DASHBOARD (NEW ENDPOINT)
# ============================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def merchant_dashboard(request):
    """
    API dashboard cho merchant (frontend: /merchant/dashboard)
    Hiển thị số lượng đơn hôm nay, doanh thu, món hết hàng và danh sách đơn gần đây
    """
    merchant = getattr(request.user, "merchant", None)
    if not merchant:
        return Response({"detail": "Bạn không phải là merchant."}, status=403)

    # Đơn hàng trong ngày
    today_orders = Order.objects.filter(
        merchant=merchant, created_at__date=now().date()
    )


    total_revenue = sum(o.total_price for o in today_orders)
    sold_out = merchant.menu_items.filter(stock=0).count()

    recent_orders = [
        {
            "code": o.code,
            "customer": getattr(o.customer, "name", "Khách"),
            "total": o.total_price,
            "payment": o.payment_method,
            "status": (
                o.get_status_display()
                if hasattr(o, "get_status_display")
                else o.status
            ),
            "time": o.created_at.strftime("%H:%M"),
        }
        for o in today_orders.order_by("-created_at")[:7]
    ]

    return Response(
        {
            "orders_today": today_orders.count(),
            "revenue_today": total_revenue,
            "sold_out": sold_out,
            "recent_orders": recent_orders,
        }
    )
