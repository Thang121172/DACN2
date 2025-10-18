from django.db import models


class MenuItem(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # Inventory: number of available units
    stock = models.IntegerField(default=0)
    # Optional merchant identifier (could be FK to merchant user model)
    merchant_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name
