from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.user import User, UserRole
from ..models.booking import Booking, BookingStatus
from ..models.service import Service
from ..models.technician import Technician
from ..schemas.booking import (
    BookingCreate,
    BookingUpdate,
    BookingResponse,
    BookingStatusUpdate,
    BookingAssignment
)
from ..auth import get_current_active_user, require_role
from ..email import send_booking_confirmation_email, send_booking_status_update_email, send_technician_assignment_email

router = APIRouter()


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CUSTOMER]))
):
    """Create a new booking (Customer only)"""
    # Verify service exists
    service = db.query(Service).filter(Service.id == booking_data.service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    # Create booking
    new_booking = Booking(
        customer_id=current_user.id,
        **booking_data.model_dump()
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # Send confirmation email to customer
    try:
        send_booking_confirmation_email(
            customer_email=current_user.email,
            customer_name=current_user.full_name,
            booking_id=new_booking.id,
            service_name=f"Service #{service.id}",
            preferred_date=str(new_booking.preferred_date),
            preferred_time=new_booking.preferred_time,
            address=new_booking.address,
            problem_description=new_booking.problem_description
        )
    except Exception as e:
        print(f"Failed to send booking confirmation email: {str(e)}")

    # Build response with customer details
    booking_dict = {
        "id": new_booking.id,
        "customer_id": new_booking.customer_id,
        "service_id": new_booking.service_id,
        "technician_id": new_booking.technician_id,
        "problem_description": new_booking.problem_description,
        "address": new_booking.address,
        "preferred_date": new_booking.preferred_date,
        "preferred_time": new_booking.preferred_time,
        "status": new_booking.status,
        "final_price": new_booking.final_price,
        "created_at": new_booking.created_at,
        "updated_at": new_booking.updated_at,
        "completed_at": new_booking.completed_at,
    }

    # Add customer details
    booking_dict["customer"] = {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone
    }

    return booking_dict


@router.get("/", response_model=List[BookingResponse])
def get_all_bookings(
    skip: int = 0,
    limit: int = 100,
    booking_status: Optional[BookingStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Get all bookings (Admin only, optionally filter by status)"""
    query = db.query(Booking)

    if booking_status:
        query = query.filter(Booking.status == booking_status)

    bookings = query.offset(skip).limit(limit).all()

    # Manually populate technician and customer details
    result = []
    for booking in bookings:
        booking_dict = {
            "id": booking.id,
            "customer_id": booking.customer_id,
            "service_id": booking.service_id,
            "technician_id": booking.technician_id,
            "problem_description": booking.problem_description,
            "address": booking.address,
            "preferred_date": booking.preferred_date,
            "preferred_time": booking.preferred_time,
            "status": booking.status,
            "final_price": booking.final_price,
            "created_at": booking.created_at,
            "updated_at": booking.updated_at,
            "completed_at": booking.completed_at,
        }

        # Add customer details
        customer = db.query(User).filter(User.id == booking.customer_id).first()
        if customer:
            booking_dict["customer"] = {
                "id": customer.id,
                "name": customer.full_name,
                "email": customer.email,
                "phone": customer.phone
            }

        # Add technician details if assigned
        if booking.technician_id:
            technician = db.query(Technician).filter(Technician.id == booking.technician_id).first()
            if technician:
                user = db.query(User).filter(User.id == technician.user_id).first()
                if user:
                    booking_dict["technician"] = {
                        "id": technician.id,
                        "user_id": technician.user_id,
                        "name": user.full_name,
                        "email": user.email,
                        "phone": user.phone,
                        "specialization": technician.specialization,
                        "experience_years": technician.experience_years,
                        "rating": technician.rating,
                        "total_jobs": technician.total_jobs
                    }

        result.append(booking_dict)

    return result


@router.get("/my-bookings", response_model=List[BookingResponse])
def get_my_bookings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.CUSTOMER]))
):
    """Get current customer's bookings"""
    bookings = db.query(Booking).filter(
        Booking.customer_id == current_user.id
    ).offset(skip).limit(limit).all()

    # Manually populate technician details
    result = []
    for booking in bookings:
        booking_dict = {
            "id": booking.id,
            "customer_id": booking.customer_id,
            "service_id": booking.service_id,
            "technician_id": booking.technician_id,
            "problem_description": booking.problem_description,
            "address": booking.address,
            "preferred_date": booking.preferred_date,
            "preferred_time": booking.preferred_time,
            "status": booking.status,
            "final_price": booking.final_price,
            "created_at": booking.created_at,
            "updated_at": booking.updated_at,
            "completed_at": booking.completed_at,
        }

        # Add technician details if assigned
        if booking.technician_id:
            technician = db.query(Technician).filter(Technician.id == booking.technician_id).first()
            if technician:
                user = db.query(User).filter(User.id == technician.user_id).first()
                if user:
                    booking_dict["technician"] = {
                        "id": technician.id,
                        "user_id": technician.user_id,
                        "name": user.full_name,
                        "email": user.email,
                        "phone": user.phone,
                        "specialization": technician.specialization,
                        "experience_years": technician.experience_years,
                        "rating": technician.rating,
                        "total_jobs": technician.total_jobs
                    }

        result.append(booking_dict)

    return result


@router.get("/technician/assigned", response_model=List[BookingResponse])
def get_assigned_bookings(
    skip: int = 0,
    limit: int = 100,
    booking_status: Optional[BookingStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TECHNICIAN]))
):
    """Get bookings assigned to current technician"""
    # Get technician profile
    technician = db.query(Technician).filter(Technician.user_id == current_user.id).first()
    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician profile not found"
        )

    query = db.query(Booking).filter(Booking.technician_id == technician.id)

    if booking_status:
        query = query.filter(Booking.status == booking_status)

    bookings = query.offset(skip).limit(limit).all()

    # Manually populate technician and customer details
    result = []
    for booking in bookings:
        booking_dict = {
            "id": booking.id,
            "customer_id": booking.customer_id,
            "service_id": booking.service_id,
            "technician_id": booking.technician_id,
            "problem_description": booking.problem_description,
            "address": booking.address,
            "preferred_date": booking.preferred_date,
            "preferred_time": booking.preferred_time,
            "status": booking.status,
            "final_price": booking.final_price,
            "created_at": booking.created_at,
            "updated_at": booking.updated_at,
            "completed_at": booking.completed_at,
        }

        # Add technician details
        booking_dict["technician"] = {
            "id": technician.id,
            "user_id": technician.user_id,
            "name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
            "specialization": technician.specialization,
            "experience_years": technician.experience_years,
            "rating": technician.rating,
            "total_jobs": technician.total_jobs
        }

        # Add customer details
        customer = db.query(User).filter(User.id == booking.customer_id).first()
        if customer:
            booking_dict["customer"] = {
                "id": customer.id,
                "name": customer.full_name,
                "email": customer.email,
                "phone": customer.phone
            }

        result.append(booking_dict)

    return result


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific booking by ID"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Check authorization
    is_customer = booking.customer_id == current_user.id
    is_admin = current_user.role == UserRole.ADMIN

    is_technician = False
    if current_user.role == UserRole.TECHNICIAN:
        technician = db.query(Technician).filter(Technician.user_id == current_user.id).first()
        is_technician = technician and booking.technician_id == technician.id

    if not (is_customer or is_admin or is_technician):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking"
        )

    # Build response with customer and technician details
    booking_dict = {
        "id": booking.id,
        "customer_id": booking.customer_id,
        "service_id": booking.service_id,
        "technician_id": booking.technician_id,
        "problem_description": booking.problem_description,
        "address": booking.address,
        "preferred_date": booking.preferred_date,
        "preferred_time": booking.preferred_time,
        "status": booking.status,
        "final_price": booking.final_price,
        "created_at": booking.created_at,
        "updated_at": booking.updated_at,
        "completed_at": booking.completed_at,
    }

    # Add customer details
    customer = db.query(User).filter(User.id == booking.customer_id).first()
    if customer:
        booking_dict["customer"] = {
            "id": customer.id,
            "name": customer.full_name,
            "email": customer.email,
            "phone": customer.phone
        }

    # Add technician details if assigned
    if booking.technician_id:
        technician = db.query(Technician).filter(Technician.id == booking.technician_id).first()
        if technician:
            user = db.query(User).filter(User.id == technician.user_id).first()
            if user:
                booking_dict["technician"] = {
                    "id": technician.id,
                    "user_id": technician.user_id,
                    "name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "specialization": technician.specialization,
                    "experience_years": technician.experience_years,
                    "rating": technician.rating,
                    "total_jobs": technician.total_jobs
                }

    return booking_dict


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update booking details (Customer own bookings or Admin)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Check authorization
    if current_user.role != UserRole.ADMIN and booking.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this booking"
        )

    # Update fields
    update_data = booking_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)

    db.commit()
    db.refresh(booking)

    # Build response with customer and technician details
    booking_dict = {
        "id": booking.id,
        "customer_id": booking.customer_id,
        "service_id": booking.service_id,
        "technician_id": booking.technician_id,
        "problem_description": booking.problem_description,
        "address": booking.address,
        "preferred_date": booking.preferred_date,
        "preferred_time": booking.preferred_time,
        "status": booking.status,
        "final_price": booking.final_price,
        "created_at": booking.created_at,
        "updated_at": booking.updated_at,
        "completed_at": booking.completed_at,
    }

    # Add customer details
    customer = db.query(User).filter(User.id == booking.customer_id).first()
    if customer:
        booking_dict["customer"] = {
            "id": customer.id,
            "name": customer.full_name,
            "email": customer.email,
            "phone": customer.phone
        }

    # Add technician details if assigned
    if booking.technician_id:
        technician = db.query(Technician).filter(Technician.id == booking.technician_id).first()
        if technician:
            user = db.query(User).filter(User.id == technician.user_id).first()
            if user:
                booking_dict["technician"] = {
                    "id": technician.id,
                    "user_id": technician.user_id,
                    "name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "specialization": technician.specialization,
                    "experience_years": technician.experience_years,
                    "rating": technician.rating,
                    "total_jobs": technician.total_jobs
                }

    return booking_dict


@router.patch("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    status_data: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update booking status (Technician or Admin)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Check authorization based on role
    is_admin = current_user.role == UserRole.ADMIN

    is_assigned_technician = False
    if current_user.role == UserRole.TECHNICIAN:
        technician = db.query(Technician).filter(Technician.user_id == current_user.id).first()
        is_assigned_technician = technician and booking.technician_id == technician.id

    if not (is_admin or is_assigned_technician):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update booking status"
        )

    # Update status
    booking.status = status_data.status

    # Set completed_at if status is completed
    if status_data.status == BookingStatus.COMPLETED:
        booking.completed_at = datetime.utcnow()

        # Update technician stats
        if booking.technician_id:
            technician = db.query(Technician).filter(Technician.id == booking.technician_id).first()
            if technician:
                technician.total_jobs += 1

    db.commit()
    db.refresh(booking)

    # Send status update email to customer
    try:
        customer = db.query(User).filter(User.id == booking.customer_id).first()
        if customer:
            technician_name = None
            technician_phone = None

            if booking.technician_id:
                technician = db.query(Technician).filter(Technician.id == booking.technician_id).first()
                if technician:
                    tech_user = db.query(User).filter(User.id == technician.user_id).first()
                    if tech_user:
                        technician_name = tech_user.full_name
                        technician_phone = tech_user.phone

            send_booking_status_update_email(
                customer_email=customer.email,
                customer_name=customer.full_name,
                booking_id=booking.id,
                new_status=booking.status.value,
                technician_name=technician_name,
                technician_phone=technician_phone
            )
    except Exception as e:
        print(f"Failed to send status update email: {str(e)}")

    # Build response with customer and technician details
    booking_dict = {
        "id": booking.id,
        "customer_id": booking.customer_id,
        "service_id": booking.service_id,
        "technician_id": booking.technician_id,
        "problem_description": booking.problem_description,
        "address": booking.address,
        "preferred_date": booking.preferred_date,
        "preferred_time": booking.preferred_time,
        "status": booking.status,
        "final_price": booking.final_price,
        "created_at": booking.created_at,
        "updated_at": booking.updated_at,
        "completed_at": booking.completed_at,
    }

    # Add customer details
    customer = db.query(User).filter(User.id == booking.customer_id).first()
    if customer:
        booking_dict["customer"] = {
            "id": customer.id,
            "name": customer.full_name,
            "email": customer.email,
            "phone": customer.phone
        }

    # Add technician details if assigned
    if booking.technician_id:
        technician = db.query(Technician).filter(Technician.id == booking.technician_id).first()
        if technician:
            user = db.query(User).filter(User.id == technician.user_id).first()
            if user:
                booking_dict["technician"] = {
                    "id": technician.id,
                    "user_id": technician.user_id,
                    "name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "specialization": technician.specialization,
                    "experience_years": technician.experience_years,
                    "rating": technician.rating,
                    "total_jobs": technician.total_jobs
                }

    return booking_dict


@router.patch("/{booking_id}/assign", response_model=BookingResponse)
def assign_technician(
    booking_id: int,
    assignment_data: BookingAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Assign a technician to a booking (Admin only)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Verify technician exists
    technician = db.query(Technician).filter(Technician.id == assignment_data.technician_id).first()
    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician not found"
        )

    # Assign technician
    booking.technician_id = assignment_data.technician_id

    # Update status to accepted if it was pending
    if booking.status == BookingStatus.PENDING:
        booking.status = BookingStatus.ACCEPTED

    db.commit()
    db.refresh(booking)

    # Send email notifications
    try:
        # Get customer details
        customer = db.query(User).filter(User.id == booking.customer_id).first()
        tech_user = db.query(User).filter(User.id == technician.user_id).first()
        service = db.query(Service).filter(Service.id == booking.service_id).first()

        if customer and tech_user:
            # Email to customer about technician assignment
            send_booking_status_update_email(
                customer_email=customer.email,
                customer_name=customer.full_name,
                booking_id=booking.id,
                new_status=booking.status.value,
                technician_name=tech_user.full_name,
                technician_phone=tech_user.phone
            )

            # Email to technician about new assignment
            send_technician_assignment_email(
                technician_email=tech_user.email,
                technician_name=tech_user.full_name,
                booking_id=booking.id,
                customer_name=customer.full_name,
                customer_phone=customer.phone,
                service_name=f"Service #{service.id}" if service else "Service",
                preferred_date=str(booking.preferred_date),
                preferred_time=booking.preferred_time,
                address=booking.address,
                problem_description=booking.problem_description
            )
    except Exception as e:
        print(f"Failed to send assignment emails: {str(e)}")

    # Build response with customer and technician details
    booking_dict = {
        "id": booking.id,
        "customer_id": booking.customer_id,
        "service_id": booking.service_id,
        "technician_id": booking.technician_id,
        "problem_description": booking.problem_description,
        "address": booking.address,
        "preferred_date": booking.preferred_date,
        "preferred_time": booking.preferred_time,
        "status": booking.status,
        "final_price": booking.final_price,
        "created_at": booking.created_at,
        "updated_at": booking.updated_at,
        "completed_at": booking.completed_at,
    }

    # Add customer details
    customer = db.query(User).filter(User.id == booking.customer_id).first()
    if customer:
        booking_dict["customer"] = {
            "id": customer.id,
            "name": customer.full_name,
            "email": customer.email,
            "phone": customer.phone
        }

    # Add technician details
    tech_user = db.query(User).filter(User.id == technician.user_id).first()
    if tech_user:
        booking_dict["technician"] = {
            "id": technician.id,
            "user_id": technician.user_id,
            "name": tech_user.full_name,
            "email": tech_user.email,
            "phone": tech_user.phone,
            "specialization": technician.specialization,
            "experience_years": technician.experience_years,
            "rating": technician.rating,
            "total_jobs": technician.total_jobs
        }

    return booking_dict


@router.patch("/{booking_id}/accept", response_model=BookingResponse)
def accept_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TECHNICIAN]))
):
    """Accept a booking (Technician only)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Get technician profile
    technician = db.query(Technician).filter(Technician.user_id == current_user.id).first()
    if not technician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technician profile not found"
        )

    # Check if booking is assigned to this technician
    if booking.technician_id != technician.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Booking not assigned to you"
        )

    # Update status
    booking.status = BookingStatus.ACCEPTED

    db.commit()
    db.refresh(booking)

    # Build response with customer and technician details
    booking_dict = {
        "id": booking.id,
        "customer_id": booking.customer_id,
        "service_id": booking.service_id,
        "technician_id": booking.technician_id,
        "problem_description": booking.problem_description,
        "address": booking.address,
        "preferred_date": booking.preferred_date,
        "preferred_time": booking.preferred_time,
        "status": booking.status,
        "final_price": booking.final_price,
        "created_at": booking.created_at,
        "updated_at": booking.updated_at,
        "completed_at": booking.completed_at,
    }

    # Add customer details
    customer = db.query(User).filter(User.id == booking.customer_id).first()
    if customer:
        booking_dict["customer"] = {
            "id": customer.id,
            "name": customer.full_name,
            "email": customer.email,
            "phone": customer.phone
        }

    # Add technician details
    tech_user = db.query(User).filter(User.id == technician.user_id).first()
    if tech_user:
        booking_dict["technician"] = {
            "id": technician.id,
            "user_id": technician.user_id,
            "name": tech_user.full_name,
            "email": tech_user.email,
            "phone": tech_user.phone,
            "specialization": technician.specialization,
            "experience_years": technician.experience_years,
            "rating": technician.rating,
            "total_jobs": technician.total_jobs
        }

    return booking_dict


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cancel a booking (Customer own bookings or Admin)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Check authorization
    if current_user.role != UserRole.ADMIN and booking.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this booking"
        )

    # Update status to cancelled instead of deleting
    booking.status = BookingStatus.CANCELLED

    db.commit()

    return None
