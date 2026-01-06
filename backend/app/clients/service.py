# backend/app/clients/service.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.users.models import User, UserRole
from app.clients.models import Client
from app.clients.schemas import ClientCreate
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
    from sqlalchemy import select
    result = await db.execute(select(Client).filter(Client.user_id == user_id))
    return result.scalars().first()