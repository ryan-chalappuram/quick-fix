from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.user import User, UserRole
from ..models.service import Service
from ..schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from ..auth import require_role

router = APIRouter()


@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    service_data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Create a new service (Admin only)"""
    # Check if service with this name already exists
    existing = db.query(Service).filter(Service.name == service_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service with this name already exists"
        )

    # Create new service
    new_service = Service(**service_data.model_dump())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    return new_service


@router.get("/", response_model=List[ServiceResponse])
def get_all_services(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """Get all services (optionally filter by category and active status)"""
    query = db.query(Service)

    if category:
        query = query.filter(Service.category == category)

    if is_active is not None:
        query = query.filter(Service.is_active == is_active)

    services = query.offset(skip).limit(limit).all()
    return services


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    """Get a specific service by ID"""
    service = db.query(Service).filter(Service.id == service_id).first()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    return service


@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Update a service (Admin only)"""
    service = db.query(Service).filter(Service.id == service_id).first()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    # Update fields
    update_data = service_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)

    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Delete a service (Admin only)"""
    service = db.query(Service).filter(Service.id == service_id).first()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    db.delete(service)
    db.commit()

    return None


@router.get("/categories/list", response_model=List[str])
def get_service_categories(db: Session = Depends(get_db)):
    """Get list of unique service categories"""
    categories = db.query(Service.category).distinct().all()
    return [cat[0] for cat in categories]
