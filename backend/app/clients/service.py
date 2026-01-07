from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models import User, UserRole
from app.clients.models import Client
from app.clients.schemas import ClientCreate, ClientUpdate
from app.core.security import get_password_hash


async def create_client(db: AsyncSession, client_in: ClientCreate) -> Client:
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
    query = select(Client).where(Client.id == client_id)
    result = await db.execute(query)
    return result.scalars().first()


async def update_client(db: AsyncSession, client_id: int, client_update: ClientUpdate) -> Client | None:
    client = await get_client_by_id(db, client_id)
    if not client:
        return None
    
    update_data = client_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    await db.commit()
    await db.refresh(client)
    return client


async def delete_client(db: AsyncSession, client_id: int) -> bool:
    query = select(Client).where(Client.id == client_id)
    result = await db.execute(query)
    client = result.scalars().first()

    if not client:
        return False

    user_query = select(User).where(User.id == client.user_id)
    user_result = await db.execute(user_query)
    user = user_result.scalars().first()

    if user:
        await db.delete(user)
    else:
        await db.delete(client)

    await db.commit()
    return True