from django.db import models
from django.utils import timezone
from django.conf import settings
import uuid


class OTPRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    identifier = models.CharField(max_length=255)  # phone or email
    code = models.CharField(max_length=8)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def is_valid(self):
        return (not self.used) and (timezone.now() < self.expires_at)

    def mark_used(self):
        self.used = True
        self.save()


class Profile(models.Model):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('merchant', 'Merchant'),
        ('shipper', 'Shipper'),
        ('admin', 'Admin'),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')

    def __str__(self):
        return f"{self.user.username} ({self.role})"

