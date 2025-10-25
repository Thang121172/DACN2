from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        # nếu bạn có signals để auto tạo Profile
        try:
            from . import signals  # noqa
        except Exception:
            pass
