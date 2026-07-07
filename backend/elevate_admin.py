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
            # Force reset password and active status because manual copy broke the hash
            user.hashed_password = hash_password("Admin@123")
            user.is_active = True
            user.role = "admin"
            db.commit()
            print(f"Successfully fixed existing user {email}. Password forced to Admin@123, role=admin")
        else:
            print("User not found in Supabase! You must create them.")
    finally:
        db.close()

if __name__ == "__main__":
    elevate()
