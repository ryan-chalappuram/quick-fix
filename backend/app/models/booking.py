from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("technicians.id"), nullable=True)

    # Booking Details
    problem_description = Column(Text, nullable=False)
    address = Column(String, nullable=False)
    preferred_date = Column(DateTime, nullable=False)
    preferred_time = Column(String, nullable=False)

    # Status and Pricing
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    final_price = Column(Float, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    customer = relationship("User", foreign_keys=[customer_id], backref="bookings")
    service = relationship("Service", backref="bookings")
    technician = relationship("Technician", foreign_keys=[technician_id], backref="assigned_bookings")
