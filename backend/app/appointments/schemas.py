from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.appointments.models import AppointmentStatus

from app.users.schemas import UserResponse
from app.clients.schemas import ClientRead
from app.pets.schemas import PetRead
from app.doctors.schemas import DoctorRead



class AppointmentCreate(BaseModel):
    doctor_id: int
    pet_id: int
    date_time: datetime
    reason: str | None = None

class AppointmentUpdate(BaseModel):
    doctor_notes: str

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