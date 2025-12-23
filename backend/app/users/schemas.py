from pydantic import BaseModel, EmailStr, ConfigDict
from .models import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: str | None = None
    address: str | None = None
    role: UserRole = UserRole.CLIENT

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)