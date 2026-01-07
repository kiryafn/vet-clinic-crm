from enum import Enum
from sqlalchemy import String, ForeignKey, Date, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.models import TimestampMixin
from typing import TYPE_CHECKING
from app.core.db import Base
from datetime import date
if TYPE_CHECKING:
    from app.clients.models import Client
    from app.appointments.models import Appointment

class PetSpecies(str, Enum):
    DOG = 'DOG'
    CAT = 'CAT'
    BIRD = 'BIRD'
    FISH = 'FISH'
    RABBIT = 'RABBIT'
    HAMSTER = 'HAMSTER'
    GUINEA_PIG = 'GUINEA_PIG'
    MOUSE_RAT = 'MOUSE_RAT'
    FERRET = 'FERRET'
    REPTILE = 'REPTILE'
    AMPHIBIAN = 'AMPHIBIAN'
    HORSE = 'HORSE'
    LIVESTOCK = 'LIVESTOCK'
    EXOTIC = 'EXOTIC'
    OTHER = 'OTHER'

class Pet(Base, TimestampMixin):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    species: Mapped[PetSpecies] = mapped_column(SqlEnum(PetSpecies),default=PetSpecies.DOG)
    breed: Mapped[str | None] = mapped_column(String(50), nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    owner_id: Mapped[int] = mapped_column(ForeignKey("clients.id"))
    owner: Mapped["Client"] = relationship(back_populates="pets")

    appointments: Mapped[list["Appointment"]] = relationship(back_populates="pet")

    @property
    def age(self) -> dict | None:
        """Calculate age from birth_date in years and months."""
        if not self.birth_date:
            return None

        today = date.today()
        years = today.year - self.birth_date.year
        months = today.month - self.birth_date.month

        # Adjust if birthday hasn't occurred this year
        if (today.month, today.day) < (self.birth_date.month, self.birth_date.day):
            years -= 1
            months = 12 - self.birth_date.month + today.month
        elif months < 0:
            months += 12

        # Adjust months if current day is before birth day in the current month
        if today.day < self.birth_date.day:
            months -= 1
            if months < 0:
                months += 12
                years -= 1

        return {"years": max(0, years), "months": max(0, months)}