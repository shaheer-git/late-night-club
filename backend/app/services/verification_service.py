from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.place import Place, PlaceStatus
from ..models.verification import Verification
from ..models.user import User


def submit_verification(
    db: Session,
    place_id: str,
    user: User,
    status: str,
    note: str | None = None,
    image_url: str | None = None,
) -> dict:
    place = db.query(Place).filter(Place.id == place_id, Place.is_active == True).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    # Check for recent conflicting verification
    cutoff = datetime.utcnow() - timedelta(hours=1)
    recent = (
        db.query(Verification)
        .filter(
            Verification.place_id == place_id,
            Verification.created_at > cutoff,
        )
        .order_by(Verification.created_at.desc())
        .first()
    )
    conflict = bool(recent and recent.status != status)

    verification = Verification(
        place_id=place_id,
        user_id=user.id,
        status=status,
        note=note,
        image_url=image_url,
    )
    db.add(verification)

    place.status = status
    place.status_updated_at = datetime.utcnow()
    place.last_verified_by_id = user.id
    place.verification_count += 1
    user.verification_count += 1

    db.commit()
    db.refresh(verification)

    # Fire conflict notification async (Celery)
    if conflict and recent and str(recent.user_id) != str(user.id):
        try:
            from ..tasks.notifications import send_conflict_notification
            send_conflict_notification.delay(
                to_user_id=str(recent.user_id),
                place_name=place.name,
                new_status=status,
            )
        except Exception:
            pass

    return {"verification": verification, "conflict_detected": conflict}


def get_verifications_for_place(db: Session, place_id: str, limit: int = 20):
    return (
        db.query(Verification)
        .filter(Verification.place_id == place_id)
        .order_by(Verification.created_at.desc())
        .limit(limit)
        .all()
    )
