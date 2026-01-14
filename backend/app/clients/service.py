from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.users.models import User, UserRole
from app.users.service import get_user_by_email
from app.clients.models import Client
from app.clients.schemas import ClientCreate, ClientUpdate
from app.core.security import get_password_hash


async def create_client_with_validation(
    db: AsyncSession, 
    client_in: ClientCreate
) -> Client:
    """Create a new client with email validation."""
    existing_user = await get_user_by_email(db, str(client_in.email))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    return await create_client(db, client_in)


async def create_client(db: AsyncSession, client_in: ClientCreate) -> Client:
    """Create a new client (internal use)."""
    db_user = User(
        email=str(client_in.email),
        password_hash=get_password_hash(client_in.password),
        role=UserRole.CLIENT
    )
    db.add(db_user)
    await db.flush()

    db_client = Client(
        user_id=db_user.id,
        full_name=client_in.full_name,
        phone_number=client_in.phone_number,
        address=client_in.address
    )
    db.add(db_client)

    await db.commit()
    await db.refresh(db_client)

    return db_client


async def get_client_by_user_id(db: AsyncSession, user_id: int) -> Client | None:
    query = select(Client).filter(Client.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_clients(db: AsyncSession, skip: int = 0, limit: int = 5) -> list[Client]:
    query = select(Client).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def get_client_by_id(db: AsyncSession, client_id: int) -> Client | None:
    """Get a client by ID. Returns None if not found."""
    query = select(Client).where(Client.id == client_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_client_or_404(db: AsyncSession, client_id: int) -> Client:
    """Get a client by ID. Raises 404 if not found."""
    client = await get_client_by_id(db, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client


async def update_client(
    db: AsyncSession, 
    client_id: int, 
    client_update: ClientUpdate
) -> Client | None:
    """Update a client. Returns None if not found."""
    client = await get_client_by_id(db, client_id)
    if not client:
        return None
    
    update_data = client_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    await db.commit()
    await db.refresh(client)
    return client


async def update_client_or_404(
    db: AsyncSession,
    client_id: int,
    client_update: ClientUpdate
) -> Client:
    """Update a client. Raises 404 if not found."""
    client = await update_client(db, client_id, client_update)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client

async def delete_client(db: AsyncSession, client_id: int) -> bool:

    query = select(Client).where(Client.id == client_id)
    result = await db.execute(query)
    client = result.scalar_one_or_none()

    if client:
        await db.delete(client)
        await db.commit()
    return True




async def delete_client_or_404(db: AsyncSession, client_id: int) -> None:
    """Delete a client. Raises 404 if not found."""
    success = await delete_client(db, client_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )