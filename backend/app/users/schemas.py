from pydantic import BaseModel, EmailStr, ConfigDict
from app.users.models import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: str | None = None
    address: str | None = None


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CLIENT


class UserRead(UserBase):
    id: int
    role: UserRole

    model_config = ConfigDict(from_attributes=True)