from pydantic import EmailStr, Field, BaseModel


class ClientCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    phone_number: str
    address: str | None = None

class ClientRead(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone_number: str
    address: str | None = None
