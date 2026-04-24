import uuid
import enum
from sqlalchemy import (
    Column, String, DateTime, Integer, Boolean,
    ForeignKey, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geography
from ..database import Base


class PlaceCategory(str, enum.Enum):
    cafe = "cafe"
    restaurant = "restaurant"
    bar = "bar"
    pharmacy = "pharmacy"
    convenience_store = "convenience_store"
    other = "other"


class PlaceStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    unknown = "unknown"


class Place(Base):
    __tablename__ = "places"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    category = Column(SAEnum(PlaceCategory), nullable=False)
    location = Column(
        Geography(geometry_type="POINT", srid=4326), nullable=False, index=True
    )
    address = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    reported_hours = Column(String(100), nullable=True)

    status = Column(SAEnum(PlaceStatus), default=PlaceStatus.unknown)
    status_updated_at = Column(DateTime(timezone=True), nullable=True)
    last_verified_by_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    added_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=True)

    image_urls = Column(ARRAY(String), default=[])
    verification_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    last_verified_by = relationship("User", foreign_keys=[last_verified_by_id])
    added_by = relationship("User", foreign_keys=[added_by_id])
    verifications = relationship(
        "Verification",
        back_populates="place",
        order_by="Verification.created_at.desc()",
    )
