from app.database import SessionLocal
from app.models.user import User
from app.utils.security import hash_password
import sys

def elevate():
    db = SessionLocal()
    try:
        email = "developer.fyrehub@gmail.com"
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.role = "admin"
            db.commit()
            print(f"Successfully elevated existing user {email} to admin")
        else:
            # Create the user
            hashed = hash_password("Admin@123")
            user = User(
                name="Admin",
                email=email,
                hashed_password=hashed,
                role="admin",
                is_verified=True,
                is_active=True
            )
            db.add(user)
            db.commit()
            print(f"Successfully created admin user {email} with password Admin@123")
    finally:
        db.close()

if __name__ == "__main__":
    elevate()
