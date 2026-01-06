from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.pets.models import Pet
from app.pets.schemas import PetCreate

async def create_pet(db: AsyncSession, pet: PetCreate, owner_id: int) -> Pet:
    db_pet = Pet(**pet.model_dump(exclude_unset=True), owner_id=owner_id)
    db.add(db_pet)
    await db.commit()
    await db.refresh(db_pet)
    return db_pet


async def get_pets_by_owner(db: AsyncSession, owner_id: int) -> list[Pet]:
    stmt = select(Pet).where(Pet.owner_id == owner_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_pet(db: AsyncSession, pet_id: int) -> Pet | None:
    return await db.get(Pet, pet_id)


async def delete_pet(db: AsyncSession, pet: Pet) -> None:
    await db.delete(pet)
    await db.commit()