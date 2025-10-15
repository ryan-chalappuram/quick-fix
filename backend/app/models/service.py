from sqlalchemy import Column, Integer, String, Text, Float, Boolean
from ..database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)  # e.g., "Electrical Repair"
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)  # e.g., "Electrical", "Plumbing", "Appliance"
    base_price = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
