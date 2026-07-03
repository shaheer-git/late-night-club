from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..schemas.user import UserResponse, UserUpdate
from ..schemas.place import PlaceListItem, PlacesResponse
from ..models.user import User
from ..models.place import Place
from ..services.storage_service import upload_file
from typing import List

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserResponse)
def update_me(
    data: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me/contributions", response_model=List[PlaceListItem])
def my_contributions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from ..services.place_service import _attach_coords
    places = (
        db.query(Place)
        .filter(Place.added_by_id == user.id, Place.is_active == True)
        .order_by(Place.created_at.desc())
        .all()
    )
    for p in places:
        _attach_coords(db, p)
        p.distance = None
    return places


@router.get("/me/verifications", response_model=List[PlaceListItem])
def my_verifications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from ..services.place_service import _attach_coords
    from ..models.verification import Verification
    places = (
        db.query(Place)
        .join(Verification, Verification.place_id == Place.id)
        .filter(Verification.user_id == user.id, Place.is_active == True)
        .distinct()
        .order_by(Place.created_at.desc())
        .all()
    )
    for p in places:
        _attach_coords(db, p)
        p.distance = None
    return places


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    url = await upload_file(file)
    user.avatar_url = url
    db.commit()
    return {"avatar_url": url}
