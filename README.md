# Vet Clinic CRM

A comprehensive Customer Relationship Management (CRM) system designed specifically for veterinary clinics. This application enables efficient management of clients, pets, doctors, and appointments through an intuitive web interface.

## 📋 Overview

Vet Clinic CRM is a full-stack web application that streamlines operations for veterinary clinics by providing:

- **Client Management**: Register and manage pet owners and their information
- **Pet Management**: Track pet details, medical history, and health records
- **Doctor Management**: Manage veterinary staff profiles and specializations
- **Appointment Scheduling**: Book, view, and manage appointments with an interactive calendar
- **Role-Based Access Control**: Secure access with different permissions for administrators, doctors, and clients

## 🎯 Key Features

### For Clients
- Register and manage personal information
- Add and manage multiple pets
- Book appointments with available doctors
- View appointment history and calendar
- Cancel appointments

### For Doctors
- View personal schedule and appointments
- See client and pet information for each appointment
- Mark appointments as completed
- Add notes to appointments

### For Administrators
- Full system access and management
- Create, update, and delete doctors
- Manage client accounts
- View and manage all appointments
- Comprehensive dashboard with action cards

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM for database operations
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **JWT (PyJWT)** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing for secure storage
- **Python 3.12+** - Programming language

### Frontend
- **React 19** - UI library for building user interfaces
- **TypeScript** - Typed superset of JavaScript
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Big Calendar** - Calendar component for appointments
- **React i18next** - Internationalization (i18n) support (English/Ukrainian)
- **Axios** - HTTP client for API requests
- **date-fns** - Date utility library

### Database
- **SQLite** - Lightweight database (configurable for production)


## 🏗️ Architecture

The project follows a clean architecture pattern:

### Backend Structure
```
backend/
├── app/
│   ├── appointments/    # Appointment management
│   ├── clients/         # Client management
│   ├── doctors/         # Doctor management
│   ├── pets/            # Pet management
│   ├── users/           # User authentication & authorization
│   └── core/            # Core utilities (config, db, security)
├── alembic/             # Database migrations
└── tests/               # Test files
```

### Frontend Structure (Feature-Sliced Design)
```
frontend/src/
├── app/                 # Application setup
├── pages/               # Page components
├── widgets/             # Complex UI components
├── features/            # Business features
├── entities/            # Business entities
└── shared/              # Shared utilities and UI
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with automatic salt generation
- **Role-Based Access Control (RBAC)**: Three roles (Admin, Doctor, Client)
- **Input Validation**: Comprehensive validation on both frontend and backend
- **Protected Routes**: Client-side route protection
- **API Security**: Endpoint protection using FastAPI dependencies

## 🌍 Internationalization

The application supports multiple languages:
- English (en)
- Ukrainian (uk)

Language detection is automatic based on browser settings, with manual switching available.

## 📦 Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables (create `.env` file):
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite+aiosqlite:///./sql_app.db
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. (Optional) Seed initial data:
```bash
python -m app.core.initial_data
```

7. Start the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API URL in `src/shared/config/config.ts` (default: `http://localhost:8000`)

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📝 Database Schema

The system uses the following main entities:
- **Users**: Authentication and authorization (Admin, Doctor, Client)
- **Clients**: Client profiles linked to users
- **Doctors**: Doctor profiles with specializations
- **Pets**: Pet information and health records
- **Appointments**: Booking and scheduling information

See `database_schema.sql` for the complete SQL schema.

## 📚 API Documentation

When the backend server is running, interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Developed as a course project demonstrating full-stack development with modern technologies.