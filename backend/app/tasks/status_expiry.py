from datetime import datetime, timedelta
from . import celery
from ..database import SessionLocal
from ..models.place import Place, PlaceStatus


@celery.task(name="app.tasks.status_expiry.expire_stale_statuses")
def expire_stale_statuses():
    """
    Runs every 30 minutes.
    Places not verified in the last 4 hours → status = 'unknown'
    """
    cutoff = datetime.utcnow() - timedelta(hours=4)
    db = SessionLocal()
    try:
        stale = (
            db.query(Place)
            .filter(
                Place.status != PlaceStatus.unknown,
                Place.status_updated_at < cutoff,
                Place.is_active == True,
            )
            .all()
        )
        for place in stale:
            place.status = PlaceStatus.unknown
        db.commit()
        return f"Expired {len(stale)} stale place statuses"
    finally:
        db.close()
