from pydantic import BaseModel, ConfigDict, model_validator
from app.users.models import UserRole

class UserResponse(BaseModel):
    id: int
    email: str
    role: UserRole
    full_name: str | None = None

    @model_validator(mode='after')
    def get_profile_data(self):
        if getattr(self, 'client_profile', None):
            self.full_name = self.client_profile.full_name

        elif getattr(self, 'doctor_profile', None):
            self.full_name = self.doctor_profile.full_name

        elif self.role == UserRole.ADMIN:
            self.full_name = "Administrator"

        if not self.full_name:
            self.full_name = self.email

        return self

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str