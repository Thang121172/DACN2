from django.db import models


class Order(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, default='pending')
    customer_id = models.IntegerField(null=True, blank=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item_id = models.IntegerField()
    quantity = models.IntegerField(default=1)
