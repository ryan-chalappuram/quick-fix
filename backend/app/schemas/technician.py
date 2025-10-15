from pydantic import BaseModel
from typing import Optional


class TechnicianCreate(BaseModel):
    user_id: int
    specialization: str
    experience_years: int = 0
    bio: Optional[str] = None


class TechnicianUpdate(BaseModel):
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None


class TechnicianResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    specialization: str
    experience_years: int
    bio: Optional[str]
    rating: float
    total_jobs: int

    class Config:
        from_attributes = True


class TechnicianWithUser(TechnicianResponse):
    """Technician response including user details"""
    user_email: str
    user_name: str
    user_phone: Optional[str]

    class Config:
        from_attributes = True
