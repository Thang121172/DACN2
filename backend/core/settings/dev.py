# WEB/backend/core/settings/dev.py
from .base import *

DEBUG = True

# Cho phép frontend dev (thêm domain/port khác nếu bạn dùng)
CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS or [
    "http://localhost:5173",
    "http://localhost:5174",
]

# Dev có thể cần tất cả hosts (tuỳ môi trường)
if "0.0.0.0" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append("0.0.0.0")
