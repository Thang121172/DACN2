# Celery application factory placeholder

from celery import Celery

celery_app = Celery('fastfood')


def setup_celery(config=None):
    return celery_app
