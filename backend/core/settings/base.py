"""
Base Django settings (minimal). Reads environment variables from .env when available.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

# Load simple .env if present
from dotenv import load_dotenv
load_dotenv(BASE_DIR / '.env')

DEBUG = os.getenv('DEBUG', 'False') in ('True', 'true', '1')
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'replace-me')

INSTALLED_APPS = [
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'corsheaders',
	'rest_framework',
	'menus',
	'orders',
	'payments',
	'accounts',
]

MIDDLEWARE = [
	# corsheaders middleware should be placed as high as possible
	'corsheaders.middleware.CorsMiddleware',
	# Debug request logger (prints request.body for /api/accounts/* when DEBUG=True)
	'core.middleware.request_logger.RequestLoggerMiddleware',
	'django.middleware.security.SecurityMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
]

LOGGING = {}

# Database (Postgres) configured from env
DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.postgresql',
		'NAME': os.getenv('POSTGRES_DB', 'fastfood'),
		'USER': os.getenv('POSTGRES_USER', 'app'),
		'PASSWORD': os.getenv('POSTGRES_PASSWORD', '123456'),
		'HOST': os.getenv('POSTGRES_HOST', '127.0.0.1'),
		'PORT': os.getenv('POSTGRES_PORT', '5432'),
	}
}

# CORS and allowed hosts
# Support a comma-separated CORS_ORIGINS environment variable (example: http://localhost:5173)
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '')
# Map to django-cors-headers setting. If empty, do not allow all origins in production.
if CORS_ORIGINS:
	# split and strip
	CORS_ALLOWED_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(',') if o.strip()]
else:
	CORS_ALLOWED_ORIGINS = []

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')
# allow Django test client host in DEBUG/dev
if DEBUG and 'testserver' not in ALLOWED_HOSTS:
	ALLOWED_HOSTS.append('testserver')

# Use BigAutoField by default to silence warnings
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Static files (for whitenoise / dev)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Minimal templates config required for admin and auth
TEMPLATES = [
	{
		'BACKEND': 'django.template.backends.django.DjangoTemplates',
		'DIRS': [],
		'APP_DIRS': True,
		'OPTIONS': {
			'context_processors': [
				'django.template.context_processors.debug',
				'django.template.context_processors.request',
				'django.contrib.auth.context_processors.auth',
				'django.contrib.messages.context_processors.messages',
			],
		},
	},
]

# NOTE: admin temporarily disabled to allow auth migrations to run cleanly

# Minimal DRF settings
REST_FRAMEWORK = {
	'DEFAULT_RENDERER_CLASSES': (
		'rest_framework.renderers.JSONRenderer',
	),
}

# Enable JWT authentication for DRF
REST_FRAMEWORK.setdefault('DEFAULT_AUTHENTICATION_CLASSES', (
    'rest_framework_simplejwt.authentication.JWTAuthentication',
))

# URL conf and WSGI
ROOT_URLCONF = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'

# Email settings (for dev use MailHog)
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', '127.0.0.1')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '1025'))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'False') in ('True', 'true', '1')
