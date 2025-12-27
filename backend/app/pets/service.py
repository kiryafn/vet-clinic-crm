from sqlalchemy import select
from sqlalchemy.orm import Session
from app.pets.models import Pet
from app.pets.schemas import PetCreate

def create_pet(db: Session, pet: PetCreate, owner_id: int) -> Pet:
    db_pet = Pet(**pet.model_dump(exclude_unset=True), owner_id=owner_id)
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet


def get_pets_by_owner(db: Session, owner_id: int) -> list[Pet]:
    stmt = select(Pet).where(Pet.owner_id == owner_id)
    result = db.execute(stmt)
    return list(result.scalars().all())