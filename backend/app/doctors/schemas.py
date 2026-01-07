from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.doctors.models import DoctorSpecialization


class DoctorCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    specialization: DoctorSpecialization
    phone_number: str | None = None
    experience_years: int | None = None
    price: int | None = None
    bio: str | None = None


class DoctorUpdate(BaseModel):
    full_name: str | None = None
    specialization: DoctorSpecialization | None = None
    phone_number: str | None = None
    experience_years: int | None = None
    price: int | None = None
    bio: str | None = None


class DoctorRead(BaseModel):
    id: int
    user_id: int
    full_name: str
    specialization: DoctorSpecialization
    phone_number: str | None = None
    experience_years: int | None = None
    price: int | None = None
    bio: str | None = None

    model_config = ConfigDict(from_attributes=True)