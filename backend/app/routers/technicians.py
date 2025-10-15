from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.user import User, UserRole
from ..models.technician import Technician
from ..schemas.technician import TechnicianCreate, TechnicianUpdate, TechnicianResponse
from ..auth import get_current_active_user, require_role

router = APIRouter()


@router.post("/", response_model=TechnicianResponse, status_code=status.HTTP_201_CREATED)
def create_technician(
    technician_data: TechnicianCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Create a new technician profile (Admin only)"""
    # Check if user exists and has technician role
    user = db.query(User).filter(User.id == technician_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.role != UserRole.TECHNICIAN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must have technician role"
        )

    # Check if technician profile already exists
    existing = db.query(Technician).filter(Technician.user_id == technician_data.user_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Technician profile already exists for this user"
        )

    # Create technician profile
    new_technician = Technician(**technician_data.model_dump())
    db.add(new_technician)
    db.commit()
    db.refresh(new_technician)

    return new_technician


@router.get("/", response_model=List[TechnicianResponse])
def get_all_technicians(
    skip: int = 0,
    limit: int = 100,
    specialization: str = None,
    db: Session = Depends(get_db)
):
    """Get all technicians (optionally filter by specialization)"""
    query = db.query(Technician)

    if specialization:
        query = query.filter(Technician.specialization == specialization)

    technicians = query.offset(skip).limit(limit).all()

    # Populate user details for each technician
    result = []
    for tech in technicians:
        tech_dict = {
            "id": tech.id,
            "user_id": tech.user_id,
            "specialization": tech.specialization,
            "experience_years": tech.experience_years,
            "bio": tech.bio,
            "rating": tech.rating,
            "total_jobs": tech.total_jobs
        }

        # Add user details
        user = db.query(User).filter(User.id == tech.user_id).first()
        if user:
            tech_dict["user_name"] = user.full_name
            tech_dict["user_email"] = user.email
            tech_dict["user_phone"] = user.phone

        result.append(tech_dict)

    return result


@router.get("/{technician_id}", response_model=TechnicianResponse)
def get_technician(technician_id: int, db: Session = Depends(get_db)):
    """Get a specific technician by ID"""
    technician = db.query(Technician).filter(Technician.id == technician_id).first()

    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician not found"
        )

    # Build response with user details
    tech_dict = {
        "id": technician.id,
        "user_id": technician.user_id,
        "specialization": technician.specialization,
        "experience_years": technician.experience_years,
        "bio": technician.bio,
        "rating": technician.rating,
        "total_jobs": technician.total_jobs
    }

    # Add user details
    user = db.query(User).filter(User.id == technician.user_id).first()
    if user:
        tech_dict["user_name"] = user.full_name
        tech_dict["user_email"] = user.email
        tech_dict["user_phone"] = user.phone

    return tech_dict


@router.put("/{technician_id}", response_model=TechnicianResponse)
def update_technician(
    technician_id: int,
    technician_data: TechnicianUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update technician profile (Admin or own profile)"""
    technician = db.query(Technician).filter(Technician.id == technician_id).first()

    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician not found"
        )

    # Check authorization: admin or own profile
    if current_user.role != UserRole.ADMIN and technician.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this technician profile"
        )

    # Update fields
    update_data = technician_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(technician, field, value)

    db.commit()
    db.refresh(technician)

    return technician


@router.delete("/{technician_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_technician(
    technician_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Delete technician profile (Admin only)"""
    technician = db.query(Technician).filter(Technician.id == technician_id).first()

    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician not found"
        )

    db.delete(technician)
    db.commit()

    return None


@router.get("/me/profile", response_model=TechnicianResponse)
def get_my_technician_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TECHNICIAN]))
):
    """Get current technician's profile"""
    technician = db.query(Technician).filter(Technician.user_id == current_user.id).first()

    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician profile not found for this user"
        )

    # Build response with user details
    tech_dict = {
        "id": technician.id,
        "user_id": technician.user_id,
        "specialization": technician.specialization,
        "experience_years": technician.experience_years,
        "bio": technician.bio,
        "rating": technician.rating,
        "total_jobs": technician.total_jobs,
        "user_name": current_user.full_name,
        "user_email": current_user.email,
        "user_phone": current_user.phone
    }

    return tech_dict
