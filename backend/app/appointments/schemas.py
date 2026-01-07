from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime, timezone
from app.appointments.models import AppointmentStatus

from app.users.schemas import UserResponse
from app.clients.schemas import ClientRead
from app.pets.schemas import PetRead
from app.doctors.schemas import DoctorRead

class AppointmentCreate(BaseModel):
    doctor_id: int = Field(..., gt=0, description="Doctor ID must be positive")
    pet_id: int = Field(..., gt=0, description="Pet ID must be positive")
    date_time: datetime = Field(..., description="Appointment date and time")
    reason: str | None = Field(None, max_length=500, description="Appointment reason (max 500 characters)")

    @field_validator('date_time')
    @classmethod
    def validate_date_time(cls, v: datetime) -> datetime:
        now = datetime.now(timezone.utc)
        
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        else:
            v = v.astimezone(timezone.utc)
        
        if v <= now:
            raise ValueError('Appointment date and time must be in the future')
        return v

    @field_validator('reason')
    @classmethod
    def validate_reason(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip() if v else None
            if v and len(v) > 500:
                raise ValueError('Reason cannot exceed 500 characters')
            if v == '':
                return None
        return v

class AppointmentUpdate(BaseModel):
    doctor_notes: str = Field(..., min_length=1, max_length=2000, description="Doctor notes (1-2000 characters)")

    @field_validator('doctor_notes')
    @classmethod
    def validate_doctor_notes(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Doctor notes cannot be empty or only whitespace')
        return v.strip()

class AppointmentRead(BaseModel):
    id: int
    status: AppointmentStatus
    date_time: datetime
    duration_minutes: int
    doctor_notes : str | None
    reason: str | None = None

    client: ClientRead
    doctor: DoctorRead
    pet: PetRead

    model_config = ConfigDict(from_attributes=True)