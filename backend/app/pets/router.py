from fastapi import APIRouter, status, HTTPException, Query
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
    """Create a new pet for the current client user."""
    return await pet_service.create_pet_for_client(
        db=db,
        pet=pet,
        current_user=current_user
    )

@router.get("/", response_model=schemas.PaginatedPets)
async def get_my_pets(
        db: SessionDep,
        current_user: CurrentUser,
        page: int = Query(1, ge=1),
        limit: int = Query(5, ge=1, le=100) # По умолчанию 5
):
    if not current_user.client_profile:
        return {"items": [], "total": 0}

    skip = (page - 1) * limit

    items, total = await pet_service.get_pets_by_owner(
        db=db,
        owner_id=current_user.client_profile.id,
        skip=skip,
        limit=limit
    )

    return {"items": items, "total": total}

@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet(
        pet_id: int,
        db: SessionDep,
        current_user: CurrentUser
):
    """Delete a pet. Only the owner can delete their pet."""
    await pet_service.delete_pet_by_id(db, pet_id, current_user)


@router.patch("/{pet_id}", response_model=schemas.PetRead)
async def update_pet(
        pet_id: int,
        pet_update: schemas.PetUpdate,
        db: SessionDep,
        current_user: CurrentUser
):
    """Update a pet. Only the owner can update their pet."""
    return await pet_service.update_pet_by_id(db, pet_id, pet_update, current_user)