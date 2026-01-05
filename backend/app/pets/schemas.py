from pydantic import BaseModel, ConfigDict
from datetime import date

from app.pets.models import PetSpecies


class PetCreate(BaseModel):
    name: str
    species: PetSpecies
    breed: str | None = None
    birth_date: date | None = None

class PetRead(BaseModel):
    id: int
    name: str
    species: PetSpecies
    breed: str | None = None
    birth_date: date | None = None
    age: dict | None

    model_config = ConfigDict(from_attributes=True)