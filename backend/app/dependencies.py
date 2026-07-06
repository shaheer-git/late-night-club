from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session
from .database import get_db
from .models.user import User
from .utils.security import decode_token

security = HTTPBearer()


async def get_current_user(
    token=Depends(security), db: Session = Depends(get_db)
) -> User:
    try:
        payload = decode_token(token.credentials)
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_optional_user(
    db: Session = Depends(get_db),
    token=Depends(HTTPBearer(auto_error=False)),
) -> User | None:
    if not token:
        return None
    try:
        payload = decode_token(token.credentials)
        user_id = payload.get("sub")
        return db.query(User).filter(User.id == user_id, User.is_active == True).first()
    except Exception:
        return None


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user
