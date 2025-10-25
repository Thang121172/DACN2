# WEB/backend/core/middleware/request_logger.py
from django.conf import settings

class RequestLoggerMiddleware:
    """
    Log gọn request.method + path và body (nếu là JSON) cho các URL /api/accounts/*
    Chỉ hoạt động khi DEBUG=True để tránh ảnh hưởng prod.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if settings.DEBUG and request.path.startswith("/api/accounts/"):
            try:
                # đọc body an toàn (Django giữ lại stream cho view)
                body = request.body.decode("utf-8")[:1000]
                print(f"[REQ][{request.method}] {request.path} :: {body}")
            except Exception:
                pass
        return self.get_response(request)
