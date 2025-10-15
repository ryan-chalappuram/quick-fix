"""
Script to create test users with proper profiles
Run this after the database tables are created
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.technician import Technician
from app.models.service import Service
from app.auth import get_password_hash

def create_test_data():
    db = SessionLocal()

    try:
        print("Creating test data...")

        # Check if data already exists
        if db.query(User).first():
            print("⚠ Users already exist. Checking for missing profiles...")

        # Create Admin User
        admin = db.query(User).filter(User.email == "admin@quickfix.com").first()
        if not admin:
            admin = User(
                email="admin@quickfix.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                phone="+1234567890",
                role=UserRole.ADMIN
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("✓ Admin user created")
        else:
            print("✓ Admin user already exists")

        # Create Customer User
        customer = db.query(User).filter(User.email == "customer@example.com").first()
        if not customer:
            customer = User(
                email="customer@example.com",
                hashed_password=get_password_hash("customer123"),
                full_name="John Doe",
                phone="+1234567891",
                role=UserRole.CUSTOMER
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
            print("✓ Customer user created")
        else:
            print("✓ Customer user already exists")

        # Create Technician Users
        tech_user1 = db.query(User).filter(User.email == "electrician@quickfix.com").first()
        if not tech_user1:
            tech_user1 = User(
                email="electrician@quickfix.com",
                hashed_password=get_password_hash("tech123"),
                full_name="Mike Johnson",
                phone="+1234567893",
                role=UserRole.TECHNICIAN
            )
            db.add(tech_user1)
            db.commit()
            db.refresh(tech_user1)
            print("✓ Electrician user created")
        else:
            print("✓ Electrician user already exists")

        tech_user2 = db.query(User).filter(User.email == "plumber@quickfix.com").first()
        if not tech_user2:
            tech_user2 = User(
                email="plumber@quickfix.com",
                hashed_password=get_password_hash("tech123"),
                full_name="Sarah Williams",
                phone="+1234567894",
                role=UserRole.TECHNICIAN
            )
            db.add(tech_user2)
            db.commit()
            db.refresh(tech_user2)
            print("✓ Plumber user created")
        else:
            print("✓ Plumber user already exists")

        # Create Technician Profiles
        tech1 = db.query(Technician).filter(Technician.user_id == tech_user1.id).first()
        if not tech1:
            tech1 = Technician(
                user_id=tech_user1.id,
                specialization="Electrician",
                experience_years=5,
                bio="Experienced electrician with 5 years in residential repairs",
                rating=4.8
            )
            db.add(tech1)
            print(f"✓ Technician profile created for {tech_user1.email} (ID: {tech_user1.id})")
        else:
            print(f"✓ Technician profile already exists for {tech_user1.email}")

        tech2 = db.query(Technician).filter(Technician.user_id == tech_user2.id).first()
        if not tech2:
            tech2 = Technician(
                user_id=tech_user2.id,
                specialization="Plumber",
                experience_years=8,
                bio="Expert plumber specializing in emergency repairs",
                rating=4.9
            )
            db.add(tech2)
            print(f"✓ Technician profile created for {tech_user2.email} (ID: {tech_user2.id})")
        else:
            print(f"✓ Technician profile already exists for {tech_user2.email}")

        db.commit()

        # Create Services
        services_data = [
            {
                "name": "Electrical Repair",
                "description": "General electrical repairs and installations",
                "category": "Electrical",
                "base_price": 75.0
            },
            {
                "name": "Wiring Installation",
                "description": "New wiring installation and rewiring services",
                "category": "Electrical",
                "base_price": 150.0
            },
            {
                "name": "Circuit Breaker Repair",
                "description": "Circuit breaker troubleshooting and replacement",
                "category": "Electrical",
                "base_price": 100.0
            },
            {
                "name": "Plumbing Repair",
                "description": "Fix leaks, clogs, and other plumbing issues",
                "category": "Plumbing",
                "base_price": 80.0
            },
            {
                "name": "Pipe Installation",
                "description": "New pipe installation and replacement",
                "category": "Plumbing",
                "base_price": 120.0
            },
            {
                "name": "Drain Cleaning",
                "description": "Professional drain cleaning and unclogging",
                "category": "Plumbing",
                "base_price": 90.0
            },
            {
                "name": "Washing Machine Repair",
                "description": "Repair for washing machines and dryers",
                "category": "Appliance",
                "base_price": 90.0
            },
            {
                "name": "Refrigerator Repair",
                "description": "Refrigerator and freezer repair services",
                "category": "Appliance",
                "base_price": 100.0
            },
            {
                "name": "Dishwasher Repair",
                "description": "Dishwasher troubleshooting and repair",
                "category": "Appliance",
                "base_price": 85.0
            },
            {
                "name": "AC Installation",
                "description": "Air conditioning installation and setup",
                "category": "HVAC",
                "base_price": 200.0
            },
            {
                "name": "Heater Repair",
                "description": "Heating system repair and maintenance",
                "category": "HVAC",
                "base_price": 110.0
            },
        ]

        service_count = 0
        for service_data in services_data:
            existing = db.query(Service).filter(Service.name == service_data["name"]).first()
            if not existing:
                service = Service(**service_data)
                db.add(service)
                service_count += 1

        db.commit()

        if service_count > 0:
            print(f"✓ {service_count} services created")
        else:
            print("✓ Services already exist")

        print("\n" + "="*50)
        print("✓ Test data setup complete!")
        print("="*50)
        print("\nLogin Credentials:")
        print("-" * 50)
        print("Admin:")
        print("  Email: admin@quickfix.com")
        print("  Password: admin123")
        print("\nCustomer:")
        print("  Email: customer@example.com")
        print("  Password: customer123")
        print("\nTechnician (Electrician):")
        print("  Email: electrician@quickfix.com")
        print("  Password: tech123")
        print("\nTechnician (Plumber):")
        print("  Email: plumber@quickfix.com")
        print("  Password: tech123")
        print("-" * 50)

    except Exception as e:
        print(f"✗ Error creating test data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()
