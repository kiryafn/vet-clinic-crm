from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db, SessionDep
from app.users.dependencies import CurrentUser
from app.users.models import User
from app.pets import schemas, service as pet_service

router = APIRouter(prefix="/pets", tags=["Pets"])

@router.post("/", response_model=schemas.PetRead, status_code=status.HTTP_201_CREATED)
def create_pet(
    pet: schemas.PetCreate,
    db: SessionDep,
    current_user: CurrentUser
):
    return pet_service.create_pet(db=db, pet=pet, owner_id=current_user.id)

@router.get("/", response_model=list[schemas.PetRead])
def get_my_pets(
    db: SessionDep,
    current_user: CurrentUser
):
    return pet_service.get_pets_by_owner(db=db, owner_id=current_user.id)