from enum import Enum
from sqlalchemy import String, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    CLIENT = "client"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    role: Mapped[UserRole] = mapped_column(default=UserRole.CLIENT)

    phone_number: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    doctor_profile: Mapped["Doctor"] = relationship("Doctor", back_populates="user", uselist=False)