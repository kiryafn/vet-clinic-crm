from datetime import date

from sqlalchemy import String, Integer, ForeignKey, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.core.models import TimestampMixin
from app.users.models import User


class Pet(Base, TimestampMixin):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    species: Mapped[str] = mapped_column(String(50))
    breed: Mapped[str | None] = mapped_column(String(50), nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped["User"] = relationship(back_populates="pets")

    @property
    def age(self) -> dict | None:
        if not self.birth_date:
            return None

        today = date.today()
        years = today.year - self.birth_date.year
        months = today.month - self.birth_date.month

        if (today.month, today.day) < (self.birth_date.month, self.birth_date.day):
            years -= 1

        if months < 0:
            months += 12

        return {"years": years, "months": months}
    
    def __repr__(self) -> str:
        return f"<Pet {self.name} ({self.species})>"
