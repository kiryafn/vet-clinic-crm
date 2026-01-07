from typing import List
from datetime import date

from pydantic import BaseModel, ConfigDict, Field, field_validator, computed_field
from app.pets.models import PetSpecies


class PetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Pet name (1-50 characters)")
    species: PetSpecies
    breed: str | None = Field(None, max_length=50, description="Pet breed (max 50 characters)")
    birth_date: date | None = None
    weight: float | None = Field(None, gt=0, le=1000, description="Pet weight in kg (0-1000)")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Name cannot be empty or only whitespace')
        return v.strip()

    @field_validator('breed')
    @classmethod
    def validate_breed(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip() if v else None
            if v and len(v) > 50:
                raise ValueError('Breed cannot exceed 50 characters')
            if v == '':
                return None
        return v

    @field_validator('birth_date')
    @classmethod
    def validate_birth_date(cls, v: date | None) -> date | None:
        if v is not None:
            today = date.today()
            if v > today:
                raise ValueError('Birth date cannot be in the future')
            # Валидация: год не должен быть меньше 1970
            if v.year < 1970:
                raise ValueError('Birth year cannot be earlier than 1970')
        return v

    @field_validator('weight')
    @classmethod
    def validate_weight(cls, v: float | None) -> float | None:
        if v is not None:
            if v <= 0:
                raise ValueError('Weight must be greater than 0')
            if v > 1000:
                raise ValueError('Weight cannot exceed 1000 kg')
        return v


class PetUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50, description="Pet name (1-50 characters)")
    species: PetSpecies | None = None
    breed: str | None = Field(None, max_length=50, description="Pet breed (max 50 characters)")
    birth_date: date | None = None
    weight: float | None = Field(None, gt=0, le=1000, description="Pet weight in kg (0-1000)")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is not None:
            if not v or not v.strip():
                raise ValueError('Name cannot be empty or only whitespace')
            return v.strip()
        return v

    @field_validator('breed')
    @classmethod
    def validate_breed(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip() if v else None
            if v and len(v) > 50:
                raise ValueError('Breed cannot exceed 50 characters')
            if v == '':
                return None
        return v

    @field_validator('birth_date')
    @classmethod
    def validate_birth_date(cls, v: date | None) -> date | None:
        if v is not None:
            today = date.today()
            if v > today:
                raise ValueError('Birth date cannot be in the future')
            if v.year < 1970:
                raise ValueError('Birth year cannot be earlier than 1970')
        return v

    @field_validator('weight')
    @classmethod
    def validate_weight(cls, v: float | None) -> float | None:
        if v is not None:
            if v <= 0:
                raise ValueError('Weight must be greater than 0')
            if v > 1000:
                raise ValueError('Weight cannot exceed 1000 kg')
        return v

class PetRead(BaseModel):
    id: int
    name: str
    species: PetSpecies
    breed: str | None = None
    birth_date: date | None = None
    weight: float | None = None

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    def age(self) -> dict | None:
        """Calculate age from birth_date."""
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

class PaginatedPets(BaseModel):
    items: List[PetRead]
    total: int