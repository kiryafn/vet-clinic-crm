from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base
from app.core.models import TimestampMixin
if TYPE_CHECKING:
    from app.users.models import User
    from app.pets.models import Pet
    from app.appointments.models import Appointment

class Client(Base, TimestampMixin):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    user: Mapped["User"] = relationship(back_populates="client_profile", cascade="all, delete-orphan",single_parent=True)

    full_name: Mapped[str] = mapped_column(String(100))
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)

    pets: Mapped[list["Pet"]] = relationship(back_populates="owner", cascade="all, delete-orphan")

    appointments: Mapped[list["Appointment"]] = relationship(back_populates="client", cascade="all, delete-orphan")