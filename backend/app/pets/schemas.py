from pydantic import BaseModel
from datetime import date


class PetBase(BaseModel):
    name: str
    species: str
    breed: str | None = None
    birth_date: date | None = None
    notes: str | None = None


class PetCreate(PetBase):
    pass


class PetRead(PetBase):
    id: int
    owner_id: int
    age: dict | None

    class Config:
        from_attributes = True