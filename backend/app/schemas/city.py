from pydantic import BaseModel, UUID4
from typing import Optional


class CityResponse(BaseModel):
    id: UUID4
    name: str
    state: Optional[str]
    country: str
    lat: float
    lng: float

    class Config:
        from_attributes = True
