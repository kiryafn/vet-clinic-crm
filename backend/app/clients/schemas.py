from pydantic import EmailStr, Field, BaseModel, field_validator


class ClientCreate(BaseModel):
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=100, description="Password (6-100 characters)")
    full_name: str = Field(..., min_length=1, max_length=100, description="Full name (1-100 characters)")
    phone_number: str = Field(..., min_length=1, max_length=20, description="Phone number (1-20 characters)")
    address: str | None = Field(None, max_length=200, description="Address (max 200 characters)")

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Full name cannot be empty or only whitespace')
        return v.strip()

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Phone number cannot be empty or only whitespace')
        # Удаляем все нецифровые символы для проверки
        digits_only = ''.join(filter(str.isdigit, v))
        if len(digits_only) < 7:
            raise ValueError('Phone number must contain at least 7 digits')
        return v.strip()

    @field_validator('address')
    @classmethod
    def validate_address(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip() if v else None
            if v and len(v) > 200:
                raise ValueError('Address cannot exceed 200 characters')
            if v == '':
                return None
        return v

class ClientUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=100, description="Full name (1-100 characters)")
    phone_number: str | None = Field(None, min_length=1, max_length=20, description="Phone number (1-20 characters)")
    address: str | None = Field(None, max_length=200, description="Address (max 200 characters)")

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: str | None) -> str | None:
        if v is not None:
            if not v or not v.strip():
                raise ValueError('Full name cannot be empty or only whitespace')
            return v.strip()
        return v

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v: str | None) -> str | None:
        if v is not None:
            if not v or not v.strip():
                raise ValueError('Phone number cannot be empty or only whitespace')
            digits_only = ''.join(filter(str.isdigit, v))
            if len(digits_only) < 7:
                raise ValueError('Phone number must contain at least 7 digits')
            return v.strip()
        return v

    @field_validator('address')
    @classmethod
    def validate_address(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip() if v else None
            if v and len(v) > 200:
                raise ValueError('Address cannot exceed 200 characters')
            if v == '':
                return None
        return v


class ClientRead(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone_number: str
    address: str | None = None
