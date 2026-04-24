from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..dependencies import get_current_user, get_optional_user
from ..schemas.place import PlaceCreate, PlaceUpdate, PlaceDetail, PlacesResponse
from ..services.place_service import (
    get_nearby_places, get_place_by_id, search_places,
    create_place, update_place, delete_place,
)
from ..models.user import User

router = APIRouter(prefix="/api/places", tags=["places"])


@router.get("", response_model=PlacesResponse)
def list_places(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: int = Query(3000),
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    return get_nearby_places(db, lat, lng, radius, status, category, limit, offset)


@router.get("/search", response_model=PlacesResponse)
def search(
    q: str = Query(..., min_length=1),
    lat: float = Query(...),
    lng: float = Query(...),
    db: Session = Depends(get_db),
):
    return search_places(db, q, lat, lng)


@router.get("/{place_id}", response_model=PlaceDetail)
def get_place(place_id: str, db: Session = Depends(get_db)):
    place = get_place_by_id(db, place_id)
    # Attach recent verifications with user names
    for v in place.verifications[:10]:
        v.user_name = v.user.name if v.user else "Unknown"
    place.recent_verifications = place.verifications[:10]
    return place


@router.post("", response_model=PlaceDetail)
def add_place(
    data: PlaceCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_place(db, data.model_dump(), user)


@router.patch("/{place_id}", response_model=PlaceDetail)
def edit_place(
    place_id: str,
    data: PlaceUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_place(db, place_id, data.model_dump(exclude_none=True), user)


@router.delete("/{place_id}")
def remove_place(
    place_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delete_place(db, place_id, user)
    return {"message": "Place deleted"}
