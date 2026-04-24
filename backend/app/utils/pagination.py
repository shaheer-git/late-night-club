from typing import TypeVar, Generic, List
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    items: List[T]
    limit: int
    offset: int
