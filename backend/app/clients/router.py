from fastapi import APIRouter, HTTPException, status, Depends
from app.core.db import SessionDep
from app.users import service as user_service
from app.clients import schemas, service
from app.users.dependencies import get_current_admin
from app.users.models import User
from typing import List

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/", response_model=schemas.ClientRead, status_code=status.HTTP_201_CREATED)
async def register_client(
    client_in: schemas.ClientCreate,
    db: SessionDep
):

    existing_user = await user_service.get_user_by_email(db, email=str(client_in.email))
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return await service.create_client(db=db, client_in=client_in)


@router.get("/", response_model=List[schemas.ClientRead])
async def read_clients(
    skip: int = 0,
    limit: int = 100,
    db: SessionDep = Depends(SessionDep),
    admin: User = Depends(get_current_admin)
):
    return await service.get_clients(db, skip=skip, limit=limit)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    db: SessionDep,
    admin: User = Depends(get_current_admin)
):
    success = await service.delete_client(db, client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client not found")