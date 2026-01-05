from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.models import TimestampMixin
from sqlalchemy import String, Enum
from typing import TYPE_CHECKING
from app.core.db import Base
import enum
if TYPE_CHECKING:
    from app.doctors.models import Doctor
    from app.clients.models import Client


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

    is_active: Mapped[bool] = mapped_column(default=True)
    is_superuser: Mapped[bool] = mapped_column(default=False)

    doctor_profile: Mapped["Doctor | None"] = relationship(back_populates="user", uselist=False)
    client_profile: Mapped["Client | None"] = relationship(back_populates="user", uselist=False)