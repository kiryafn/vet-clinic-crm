from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.pets.models import Pet
from app.pets.schemas import PetCreate, PetUpdate
from app.users.models import User


async def create_pet_for_client(
    db: AsyncSession, 
    pet: PetCreate, 
    current_user: User
) -> Pet:
    """Create a pet for the current client user."""
    if not current_user.client_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with Client profile can add pets."
        )
    
    db_pet = Pet(**pet.model_dump(exclude_unset=True), owner_id=current_user.client_profile.id)
    db.add(db_pet)
    await db.commit()
    await db.refresh(db_pet)
    return db_pet


async def create_pet(db: AsyncSession, pet: PetCreate, owner_id: int) -> Pet:
    """Create a pet (internal use)."""
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


async def delete_pet_by_id(
    db: AsyncSession, 
    pet_id: int, 
    current_user: User
) -> None:
    """Delete a pet by ID with authorization check."""
    if not current_user.client_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    pet = await get_pet(db, pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found"
        )
    
    if pet.owner_id != current_user.client_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this pet"
        )
    
    await db.delete(pet)
    await db.commit()


async def delete_pet(db: AsyncSession, pet: Pet) -> None:
    """Delete a pet (internal use)."""
    await db.delete(pet)
    await db.commit()


async def update_pet_by_id(
    db: AsyncSession,
    pet_id: int,
    pet_update: PetUpdate,
    current_user: User
) -> Pet:
    """Update a pet by ID with authorization check."""
    if not current_user.client_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    pet = await get_pet(db, pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found"
        )
    
    if pet.owner_id != current_user.client_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this pet"
        )
    
    return await update_pet(db, pet, pet_update)


async def update_pet(db: AsyncSession, pet: Pet, pet_update: PetUpdate) -> Pet:
    """Update a pet (internal use)."""
    update_data = pet_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pet, key, value)

    await db.commit()
    await db.refresh(pet)
    return pet