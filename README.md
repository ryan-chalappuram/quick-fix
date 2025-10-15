# QuickFix - Technician Booking & Dispatch Portal

A full-stack platform for booking home services (electricians, plumbers, appliance repair) with separate dashboards for customers, technicians, and admins.

## Tech Stack

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- JWT Authentication
- Alembic (migrations)

### Frontend
- React 18
- React Router v6
- Vite
- Axios

### DevOps
- Docker & Docker Compose
- GitLab CI/CD
- AWS ECS / Render

## Project Structure

```
SkillDevelopmentProject/
├── backend/
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routers/        # API endpoints
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database connection
│   │   └── main.py         # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service calls
│   │   ├── contexts/       # React contexts
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file from .env.example
cp .env.example .env

# Run the server
uvicorn app.main:app --reload
```

Backend will run on http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:3000

## Features

### Customer Interface
- Sign up / Login
- Book services (choose type, date/time, address, description)
- View, cancel, reschedule bookings
- Track booking status (Pending → Accepted → In Progress → Completed)

### Technician Dashboard
- View assigned bookings
- Accept/reject requests
- Update booking status
- View weekly schedule

### Admin Panel
- View all service requests
- Assign technicians
- Monitor job load per technician
- Analytics dashboard

## Development Status

Project is currently under development. See the task list for current progress.
