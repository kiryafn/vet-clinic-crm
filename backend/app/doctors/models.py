from sqlalchemy import String, Integer, ForeignKey, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Specialization(Base):
    __tablename__ = "specializations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    doctors: Mapped[list["Doctor"]] = relationship(back_populates="specialization")


class Doctor(Base):
    __tablename__ = "doctors"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)

    specialization_id: Mapped[int] = mapped_column(ForeignKey("specializations.id"))

    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float, default=0.0)

    user: Mapped["User"] = relationship("User", back_populates="doctor_profile")

    specialization: Mapped["Specialization"] = relationship(back_populates="doctors")