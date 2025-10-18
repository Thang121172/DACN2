from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer
from menus.models import MenuItem


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=True, methods=['post'])
    def set_status(self, request, pk=None):
        order = self.get_object()
        status_val = request.data.get('status')
        if not status_val:
            return Response({'detail': 'status required'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = status_val
        order.save()
        return Response({'status': order.status})


class MerchantViewSet(viewsets.ViewSet):
    """Basic merchant endpoints to manage menu stock"""

    def list(self, request):
        qs = MenuItem.objects.all()
        data = [{'id': m.id, 'name': m.name, 'price': str(m.price), 'stock': m.stock, 'merchant_id': m.merchant_id} for m in qs]
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


class ShipperViewSet(viewsets.ViewSet):
    def list(self, request):
        qs = Order.objects.exclude(status='delivered')
        data = [{'id': o.id, 'status': o.status, 'created_at': o.created_at.isoformat()} for o in qs]
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
