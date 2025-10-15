from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from ..models.user import UserRole


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True
