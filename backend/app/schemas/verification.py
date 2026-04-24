from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime


class VerificationCreate(BaseModel):
    place_id: UUID4
    status: str
    note: Optional[str] = None


class VerificationResponse(BaseModel):
    id: UUID4
    place_id: UUID4
    user_id: UUID4
    status: str
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class VerificationResult(BaseModel):
    verification: VerificationResponse
    conflict_detected: bool
