from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.db import SessionDep
from app.users import service as user_service
from app.clients import schemas, service
from app.users.dependencies import get_current_admin
from app.users.models import User

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/", response_model=schemas.ClientRead, status_code=status.HTTP_201_CREATED)
async def register_client(
    client_in: schemas.ClientCreate,
    db: SessionDep
):
    """Register a new client."""
    return await service.create_client_with_validation(db=db, client_in=client_in)


@router.get("/", response_model=List[schemas.ClientRead])
async def read_clients(
    db: SessionDep,
    skip: int = 0,
    limit: int = 100,
    admin: User = Depends(get_current_admin)
):
    return await service.get_clients(db, skip=skip, limit=limit)


@router.get("/{client_id}", response_model=schemas.ClientRead)
async def get_client(
    client_id: int,
    db: SessionDep,
    admin: User = Depends(get_current_admin)
):
    """Get a client by ID. Admin only."""
    return await service.get_client_or_404(db, client_id)


@router.patch("/{client_id}", response_model=schemas.ClientRead)
async def update_client(
    client_id: int,
    client_update: schemas.ClientUpdate,
    db: SessionDep,
    admin: User = Depends(get_current_admin)
):
    """Update a client. Admin only."""
    return await service.update_client_or_404(db, client_id, client_update)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    db: SessionDep,
    admin: User = Depends(get_current_admin)
):
    """Delete a client. Admin only."""
    await service.delete_client_or_404(db, client_id)