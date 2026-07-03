from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.user import User
from ..utils.security import hash_password, verify_password, create_access_token, create_refresh_token


def register_user(db: Session, name: str, email: str, password: str) -> User:
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=name, email=email, hashed_password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user


def make_tokens(user: User, is_new_user: bool = False) -> dict:
    data = {"sub": str(user.id)}
    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data),
        "token_type": "bearer",
        "user": user,
        "is_new_user": is_new_user,
    }
