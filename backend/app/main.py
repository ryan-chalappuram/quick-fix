from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base

# Import models to register them with SQLAlchemy
from .models import user, technician, service, booking

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QuickFix API",
    description="Technician Booking & Dispatch Portal API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to QuickFix API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Import and include routers
from .routers import auth, technicians, services, bookings

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(technicians.router, prefix="/api/technicians", tags=["Technicians"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
