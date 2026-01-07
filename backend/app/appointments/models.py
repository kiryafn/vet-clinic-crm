from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Text, DateTime, Enum

from app.core.models import TimestampMixin
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from app.core.db import Base
import enum
if TYPE_CHECKING:
    from app.doctors.models import Doctor
    from app.pets.models import Pet
    from app.clients.models import Client


class AppointmentStatus(str, enum.Enum):
    PLANNED = "planned"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    date_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    duration_minutes: Mapped[int] = mapped_column(default=45)
    status: Mapped[AppointmentStatus] = mapped_column(Enum(AppointmentStatus), default=AppointmentStatus.PLANNED)
    reason: Mapped[str] = mapped_column(Text)
    doctor_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"))
    client: Mapped["Client"] = relationship("Client", back_populates="appointments")

    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"))
    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="appointments")

    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id"))
    pet: Mapped["Pet"] = relationship("Pet", back_populates="appointments")

    def cancel(self):
        self.status = AppointmentStatus.CANCELLED

    def complete(self):
        self.status = AppointmentStatus.COMPLETED
