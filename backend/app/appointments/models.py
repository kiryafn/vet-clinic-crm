import enum
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, Text, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base
from app.users.models import User
from app.doctors.models import Doctor
from app.pets.models import Pet

class AppointmentStatus(str, enum.Enum):
    PLANNED = "planned"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"))

    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id"))

    date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus),
        default=AppointmentStatus.PLANNED
    )
    user_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    doctor_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship()
    doctor: Mapped["Doctor"] = relationship()
    pet: Mapped["Pet"] = relationship()