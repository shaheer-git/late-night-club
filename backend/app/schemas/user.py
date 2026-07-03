from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    primary_city: Optional[str] = None


class UserResponse(UserBase):
    id: UUID4
    avatar_url: Optional[str]
    primary_city: Optional[str] = None
    contribution_count: int
    verification_count: int
    points: int
    created_at: datetime

    class Config:
        from_attributes = True


class VerifierInfo(BaseModel):
    id: UUID4
    name: str
    avatar_url: Optional[str]

    class Config:
        from_attributes = True
