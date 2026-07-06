from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class DashboardTrends(BaseModel):
    users_pct: Optional[float] = None
    places_pct: Optional[float] = None
    pending_pct: Optional[float] = None
    verifications_pct: Optional[float] = None

class DashboardStats(BaseModel):
    total_users: int
    total_places: int
    pending_places: int
    total_verifications: int
    trends: DashboardTrends

class AdminUserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    points: int
    is_active: bool
    is_verified: bool
    created_at: str

class PaginatedUsersResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[AdminUserResponse]

class ActivityStatItem(BaseModel):
    date: str
    new_users: int
    new_places: int

class ActivityStatResponse(BaseModel):
    data: List[ActivityStatItem]

class VerificationStatItem(BaseModel):
    date: str
    open: int
    closed: int
    unknown: int

class VerificationStatResponse(BaseModel):
    data: List[VerificationStatItem]

class ActivityFeedItem(BaseModel):
    type: str
    user_name: str
    place_name: Optional[str] = None
    city: Optional[str] = None
    status: Optional[str] = None
    auth_method: Optional[str] = None
    created_at: str

class ActivityFeedResponse(BaseModel):
    items: List[ActivityFeedItem]

class TopCityItem(BaseModel):
    city: str
    place_count: int
    verification_count: int

class UserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None

class PlaceUpdate(BaseModel):
    is_active: Optional[bool] = None
    name: Optional[str] = None
    category: Optional[str] = None

class AdminVerificationItem(BaseModel):
    id: str
    place_id: str
    place_name: str
    city: str
    user_id: str
    user_name: str
    status: str
    created_at: str

class PaginatedVerificationsResponse(BaseModel):
    items: List[AdminVerificationItem]
    total: int
    page: int
    size: int

class PlaceImageItem(BaseModel):
    id: str
    public_id: str
    url: str
    secure_url: str
    thumbnail_url: str
    created_at: Optional[str] = None

class PlaceImagesResponse(BaseModel):
    images: List[PlaceImageItem]

class DeletedCountResponse(BaseModel):
    deleted: int

class SuccessResponse(BaseModel):
    success: bool
