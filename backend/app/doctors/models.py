from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.core.models import TimestampMixin
from app.users import User

if TYPE_CHECKING:
    from app.users import User
    from app.appointments.models import Appointment


class Specialization(Base):
    __tablename__ = "specializations"

    id: Mapped[int] = mapped_column(primary_key=True)

    name_ru: Mapped[str] = mapped_column(String(100), unique=True)
    name_en: Mapped[str] = mapped_column(String(100), unique=True)

    description_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)

    doctors: Mapped[list["Doctor"]] = relationship(back_populates="specialization")


class Doctor(Base, TimestampMixin):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    user: Mapped["User"] = relationship(lazy="joined")

    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[int] = mapped_column(Integer, default=1000)

    specialization_id: Mapped[int] = mapped_column(ForeignKey("specializations.id"))
    specialization: Mapped["Specialization"] = relationship(back_populates="doctors", lazy="joined")

    appointments: Mapped[list["Appointment"]] = relationship(back_populates="doctor")

    @property
    def full_name(self) -> str:
        return self.user.full_name if self.user else "Unknown"