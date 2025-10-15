from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from ..database import Base


class Technician(Base):
    __tablename__ = "technicians"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    specialization = Column(String, nullable=False)  # e.g., "Electrician", "Plumber"
    experience_years = Column(Integer, default=0)
    bio = Column(Text, nullable=True)
    rating = Column(Float, default=0.0)
    total_jobs = Column(Integer, default=0)

    # Relationship
    user = relationship("User", backref="technician_profile")
