from celery import Celery
from ..config import settings

celery = Celery(
    "lnc",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.status_expiry", "app.tasks.notifications"],
)

celery.conf.beat_schedule = {
    "expire-stale-statuses": {
        "task": "app.tasks.status_expiry.expire_stale_statuses",
        "schedule": 1800.0,  # every 30 minutes
    },
}
celery.conf.timezone = "UTC"
