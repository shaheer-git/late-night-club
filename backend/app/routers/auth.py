from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.auth import (
    LoginRequest, RegisterRequest, TokenResponse,
    RefreshRequest, FcmTokenRequest,
)
from ..schemas.user import UserResponse
from ..services.auth_service import register_user, login_user, make_tokens
from ..utils.security import decode_token
from ..models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, req.name, req.email, req.password)
    return make_tokens(user)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = login_user(db, req.email, req.password)
    return make_tokens(user)


@router.post("/refresh")
def refresh(req: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(req.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        from ..utils.security import create_access_token
        return {"access_token": create_access_token({"sub": str(user.id)})}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post("/logout")
def logout(user: User = Depends(get_current_user)):
    return {"message": "Logged out"}


@router.post("/fcm-token")
def save_fcm_token(
    req: FcmTokenRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.fcm_token = req.fcm_token
    db.commit()
    return {"message": "FCM token saved"}
