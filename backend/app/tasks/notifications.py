from . import celery
from ..database import SessionLocal
from ..models.user import User


@celery.task(name="app.tasks.notifications.send_conflict_notification")
def send_conflict_notification(to_user_id: str, place_name: str, new_status: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == to_user_id).first()
        if not user or not user.fcm_token:
            return

        try:
            import firebase_admin
            from firebase_admin import messaging

            message = messaging.Message(
                notification=messaging.Notification(
                    title="Status update 🌙",
                    body=f"{place_name} was just marked {new_status} by another user.",
                ),
                token=user.fcm_token,
            )
            messaging.send(message)
        except Exception as e:
            print(f"FCM send failed: {e}")
    finally:
        db.close()
