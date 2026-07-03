from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime
from .user import VerifierInfo


class PlaceBase(BaseModel):
    name: str
    category: str
    address: Optional[str] = None
    phone: Optional[str] = None
    reported_hours: Optional[str] = None


class PlaceCreate(PlaceBase):
    lat: float
    lng: float
    status: str = "open"
    image_urls: List[str] = []


class PlaceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    reported_hours: Optional[str] = None
    status: Optional[str] = None


class PlaceListItem(PlaceBase):
    id: UUID4
    status: str
    image_urls: List[str]
    distance: Optional[float] = None
    last_verified_at: Optional[datetime] = None
    last_verified_by: Optional[VerifierInfo] = None
    verification_count: int
    lat: float
    lng: float

    class Config:
        from_attributes = True


class VerificationItem(BaseModel):
    id: UUID4
    user_id: UUID4
    user_name: str
    status: str
    note: Optional[str]
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PlaceDetail(PlaceListItem):
    recent_verifications: List[VerificationItem] = []
    added_by: Optional[VerifierInfo] = None
    created_at: datetime


class PlacesResponse(BaseModel):
    total: int
    items: List[PlaceListItem]
