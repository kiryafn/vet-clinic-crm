from fastapi import APIRouter, HTTPException, status
from app.core.db import SessionDep
from app.users import service as user_service
from app.clients import schemas, service

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