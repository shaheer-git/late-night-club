import uuid
from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geography
from ..database import Base


class City(Base):
    __tablename__ = "cities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False)
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    is_active = Column(Boolean, default=True)
