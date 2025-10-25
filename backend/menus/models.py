from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Merchant(models.Model):
    owner      = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_merchants")
    name       = models.CharField(max_length=120)
    address    = models.CharField(max_length=255, blank=True)
    phone      = models.CharField(max_length=30, blank=True)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name

class MerchantMember(models.Model):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        STAFF = "staff", "Staff"

    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name="merchant_memberships")
    merchant  = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name="members")
    role      = models.CharField(max_length=10, choices=Role.choices, default=Role.STAFF)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "merchant")

    def __str__(self) -> str:
        return f"{self.user} @ {self.merchant} ({self.role})"


# ====== GIỮ LẠI MenuItem NHƯ BẢN CỦA BẠN ======
class MenuItem(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    merchant_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name
