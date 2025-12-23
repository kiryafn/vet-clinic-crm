from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.users.models import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: str | None = None
    address: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=50)

class UserRead(UserBase):
    id: int
    role: UserRole

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str