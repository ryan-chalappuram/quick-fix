from pydantic import BaseModel
from typing import Optional


class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    base_price: float = 0.0


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    base_price: Optional[float] = None
    is_active: Optional[bool] = None


class ServiceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: str
    base_price: float
    is_active: bool

    class Config:
        from_attributes = True
