from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models.city import City
from ..schemas.city import CityResponse

router = APIRouter(prefix="/api/cities", tags=["cities"])


def _attach_city_coords(db: Session, city: City) -> City:
    wkt = db.scalar(func.ST_AsText(city.location))
    if wkt:
        coords = wkt.replace("POINT(", "").replace(")", "").split()
        city.lng = float(coords[0])
        city.lat = float(coords[1])
    else:
        city.lat = 0.0
        city.lng = 0.0
    return city


@router.get("", response_model=List[CityResponse])
def list_cities(db: Session = Depends(get_db)):
    cities = db.query(City).filter(City.is_active == True).all()
    return [_attach_city_coords(db, c) for c in cities]


@router.get("/search", response_model=List[CityResponse])
def search_cities(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    cities = (
        db.query(City)
        .filter(City.is_active == True, City.name.ilike(f"%{q}%"))
        .limit(10)
        .all()
    )
    return [_attach_city_coords(db, c) for c in cities]
