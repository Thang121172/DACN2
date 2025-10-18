from rest_framework.permissions import BasePermission


class IsMerchant(BasePermission):
    def has_permission(self, request, view):
        return False


class IsShipper(BasePermission):
    def has_permission(self, request, view):
        return False


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return True
