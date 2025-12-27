from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.appointments.models import AppointmentStatus

from app.users.schemas import UserResponse
from app.pets.schemas import PetRead
from app.doctors.schemas import DoctorRead


class AppointmentBase(BaseModel):
    user_description: str | None = None


class AppointmentCreate(AppointmentBase):
    doctor_id: int
    pet_id: int
    date_time: datetime

class AppointmentUpdate(BaseModel):
    doctor_notes: str

class AppointmentRead(AppointmentBase):
    id: int
    status: AppointmentStatus
    date_time: datetime
    doctor_notes : str | None

    user: UserResponse
    doctor: DoctorRead
    pet: PetRead

    model_config = ConfigDict(from_attributes=True)