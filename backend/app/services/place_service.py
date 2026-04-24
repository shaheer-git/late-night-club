from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from geoalchemy2.functions import ST_DWithin, ST_Distance, ST_MakePoint, ST_SetSRID, ST_X, ST_Y
from fastapi import HTTPException
from typing import Optional
from ..models.place import Place, PlaceStatus, PlaceCategory
from ..models.user import User


def _user_point(lng: float, lat: float):
    return ST_SetSRID(ST_MakePoint(lng, lat), 4326)


def _attach_coords(db: Session, place: Place) -> Place:
    """Attach lat/lng float attributes to a Place ORM object."""
    geom = func.ST_AsText(place.location)
    wkt = db.scalar(geom)
    if wkt:
        # WKT format: POINT(lng lat)
        coords = wkt.replace("POINT(", "").replace(")", "").split()
        place.lng = float(coords[0])
        place.lat = float(coords[1])
    else:
        place.lat = 0.0
        place.lng = 0.0
    return place


def get_nearby_places(
    db: Session,
    lat: float,
    lng: float,
    radius_meters: int = 3000,
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> dict:
    user_point = _user_point(lng, lat)

    query = db.query(Place).filter(
        Place.is_active == True,
        ST_DWithin(Place.location, user_point, radius_meters),
    )

    if status:
        query = query.filter(Place.status == status)
    if category:
        query = query.filter(Place.category == category)

    query = query.order_by(ST_Distance(Place.location, user_point))

    total = query.count()
    places = query.offset(offset).limit(limit).all()

    for place in places:
        place.distance = db.scalar(ST_Distance(place.location, user_point))
        _attach_coords(db, place)

    return {"total": total, "items": places}


def get_place_by_id(db: Session, place_id: str) -> Place:
    place = db.query(Place).filter(Place.id == place_id, Place.is_active == True).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    _attach_coords(db, place)
    return place


def search_places(db: Session, q: str, lat: float, lng: float, limit: int = 20) -> dict:
    user_point = _user_point(lng, lat)
    query = db.query(Place).filter(
        Place.is_active == True,
        or_(
            Place.name.ilike(f"%{q}%"),
            Place.address.ilike(f"%{q}%"),
        ),
    ).order_by(ST_Distance(Place.location, user_point))

    total = query.count()
    places = query.limit(limit).all()
    for place in places:
        place.distance = db.scalar(ST_Distance(place.location, user_point))
        _attach_coords(db, place)

    return {"total": total, "items": places}


def create_place(db: Session, data: dict, user: User) -> Place:
    lat = data.pop("lat")
    lng = data.pop("lng")
    place = Place(
        **data,
        location=_user_point(lng, lat),
        added_by_id=user.id,
    )
    db.add(place)
    user.contribution_count += 1
    db.commit()
    db.refresh(place)
    _attach_coords(db, place)
    return place


def update_place(db: Session, place_id: str, data: dict, user: User) -> Place:
    place = get_place_by_id(db, place_id)
    if str(place.added_by_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in data.items():
        if v is not None:
            setattr(place, k, v)
    db.commit()
    db.refresh(place)
    _attach_coords(db, place)
    return place


def delete_place(db: Session, place_id: str, user: User) -> None:
    place = get_place_by_id(db, place_id)
    if str(place.added_by_id) != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    place.is_active = False
    db.commit()
