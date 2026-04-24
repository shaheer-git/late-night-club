from geoalchemy2.functions import ST_MakePoint, ST_SetSRID, ST_X, ST_Y
from sqlalchemy.orm import Session


def make_point(lng: float, lat: float):
    """Return a PostGIS geography point."""
    return ST_SetSRID(ST_MakePoint(lng, lat), 4326)


def extract_lat(session: Session, geography_col) -> float:
    return session.scalar(ST_Y(geography_col.cast("geometry")))


def extract_lng(session: Session, geography_col) -> float:
    return session.scalar(ST_X(geography_col.cast("geometry")))
