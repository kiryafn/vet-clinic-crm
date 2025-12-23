from pydantic import BaseModel, EmailStr, Field


class DoctorCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    phone_number: str | None = None

    specialization_id: int
    experience_years: int | None = None
    price: int | None = None
    bio: str | None = None


class DoctorRead(BaseModel):
    id: int
    full_name: str
    specialization_name: str

    class Config:
        from_attributes = True