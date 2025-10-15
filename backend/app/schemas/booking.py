from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.booking import BookingStatus


class BookingCreate(BaseModel):
    service_id: int
    problem_description: str
    address: str
    preferred_date: datetime
    preferred_time: str


class BookingUpdate(BaseModel):
    problem_description: Optional[str] = None
    address: Optional[str] = None
    preferred_date: Optional[datetime] = None
    preferred_time: Optional[str] = None
    final_price: Optional[float] = None


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingAssignment(BaseModel):
    technician_id: int


class BookingResponse(BaseModel):
    id: int
    customer_id: int
    customer: Optional[dict] = None
    service_id: int
    technician_id: Optional[int]
    technician: Optional[dict] = None
    problem_description: str
    address: str
    preferred_date: datetime
    preferred_time: str
    status: BookingStatus
    final_price: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class BookingWithDetails(BookingResponse):
    """Booking with related service and customer details"""
    service_name: str
    service_category: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str]
    technician_name: Optional[str]

    class Config:
        from_attributes = True
