import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
from .place import PlaceStatus


class Verification(Base):
    __tablename__ = "verifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    place_id = Column(
        UUID(as_uuid=True), ForeignKey("places.id"), nullable=False, index=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(SAEnum(PlaceStatus), nullable=False)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    place = relationship("Place", back_populates="verifications")
    user = relationship("User")
