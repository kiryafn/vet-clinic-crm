import enum

from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from app.core.db import Base
from app.core.models import TimestampMixin

if TYPE_CHECKING:
    from app.doctors.models import Doctor
    from app.pets.models import Pet


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    CLIENT = "client"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    full_name: Mapped[str] = mapped_column(String(100))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.CLIENT)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # created_at is provided by TimestampMixin

    doctor: Mapped["Doctor"] = relationship(back_populates="user", uselist=False)

    pets: Mapped[list["Pet"]] = relationship(back_populates="owner")
    
    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"