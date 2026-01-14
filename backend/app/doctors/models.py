from sqlalchemy import String, Integer, ForeignKey, Text, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.models import TimestampMixin
from typing import TYPE_CHECKING
from app.core.db import Base
import enum
if TYPE_CHECKING:
    from app.users.models import User
    from app.appointments.models import Appointment

class DoctorSpecialization(str, enum.Enum):
    OPHTHALMOLOGIST = "OPHTHALMOLOGIST"
    DERMATOLOGIST = "DERMATOLOGIST"
    CARDIOLOGIST = "CARDIOLOGIST"
    THERAPIST = "THERAPIST"
    SURGEON = "SURGEON"
    DENTIST = "DENTIST"

class Doctor(Base, TimestampMixin):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    user: Mapped["User"] = relationship(back_populates="doctor_profile", lazy="joined", cascade="all, delete-orphan", single_parent=True)

    full_name: Mapped[str] = mapped_column(String(100))
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    specialization: Mapped[DoctorSpecialization] = mapped_column(SqlEnum(DoctorSpecialization), default=DoctorSpecialization.THERAPIST)

    appointments: Mapped[list["Appointment"]] = relationship(back_populates="doctor", cascade="all, delete-orphan")