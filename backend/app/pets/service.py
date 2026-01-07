from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.pets.models import Pet
from app.pets.schemas import PetCreate, PetUpdate


async def create_pet(db: AsyncSession, pet: PetCreate, owner_id: int) -> Pet:
    db_pet = Pet(**pet.model_dump(exclude_unset=True), owner_id=owner_id)
    db.add(db_pet)
    await db.commit()
    await db.refresh(db_pet)
    return db_pet


async def get_pets_by_owner(
        db: AsyncSession,
        owner_id: int,
        skip: int = 0,
        limit: int = 100
) -> tuple[list[Pet], int]:

    query = select(Pet).where(Pet.owner_id == owner_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)

    return result.scalars().all(), total


async def get_pet(db: AsyncSession, pet_id: int) -> Pet | None:
    return await db.get(Pet, pet_id)


async def delete_pet(db: AsyncSession, pet: Pet) -> None:
    await db.delete(pet)
    await db.commit()


async def update_pet(db: AsyncSession, pet: Pet, pet_update: PetUpdate) -> Pet:
    update_data = pet_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pet, key, value)

    await db.commit()
    await db.refresh(pet)
    return pet