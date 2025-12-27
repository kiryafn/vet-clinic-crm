from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.users import User


class Specialization(Base):
    __tablename__ = "specializations"

    id: Mapped[int] = mapped_column(primary_key=True)

    name_ru: Mapped[str] = mapped_column(String(100), unique=True)
    name_en: Mapped[str] = mapped_column(String(100), unique=True)

    description_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)

    doctors: Mapped[list["Doctor"]] = relationship(back_populates="specialization")


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    specialization_id: Mapped[int] = mapped_column(ForeignKey("specializations.id"))
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[int] = mapped_column(Integer, default=1000)  # Цена за прием (в копейках или целых единицах)

    user: Mapped["User"] = relationship(lazy="joined")
    specialization: Mapped["Specialization"] = relationship(back_populates="doctors", lazy="joined")

    @property
    def full_name(self) -> str:
        return self.user.full_name if self.user else "Unknown"

    @property
    def specialization_name(self) -> str:
        return self.specialization.name_ru if self.specialization else "Unknown"