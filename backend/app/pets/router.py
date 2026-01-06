from fastapi import APIRouter, status, HTTPException
from app.core.db import SessionDep
from app.users.dependencies import CurrentUser
from app.pets import schemas, service as pet_service

router = APIRouter(prefix="/pets", tags=["Pets"])


@router.post("/", response_model=schemas.PetRead, status_code=status.HTTP_201_CREATED)
async def create_pet(
        pet: schemas.PetCreate,
        db: SessionDep,
        current_user: CurrentUser
):
    if not current_user.client_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users with Client profile can add pets. Doctors cannot have pets on this account."
        )

    return await pet_service.create_pet(
        db=db,
        pet=pet,
        owner_id=current_user.client_profile.id
    )


@router.get("/", response_model=list[schemas.PetRead])
async def get_my_pets(
        db: SessionDep,
        current_user: CurrentUser
):
    if not current_user.client_profile:
        return []

    return await pet_service.get_pets_by_owner(
        db=db,
        owner_id=current_user.client_profile.id
    )


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet(
        pet_id: int,
        db: SessionDep,
        current_user: CurrentUser
):
    if not current_user.client_profile:
         raise HTTPException(status_code=403, detail="Not authorized")

    pet = await pet_service.get_pet(db, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    if pet.owner_id != current_user.client_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this pet")

    await pet_service.delete_pet(db, pet)


@router.patch("/{pet_id}", response_model=schemas.PetRead)
async def update_pet(
        pet_id: int,
        pet_update: schemas.PetUpdate,
        db: SessionDep,
        current_user: CurrentUser
):
    if not current_user.client_profile:
         raise HTTPException(status_code=403, detail="Not authorized")

    pet = await pet_service.get_pet(db, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    if pet.owner_id != current_user.client_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this pet")

    return await pet_service.update_pet(db, pet, pet_update)