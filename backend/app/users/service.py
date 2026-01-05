from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.models import Client
from app.users.models import User, UserRole
from app.users.schemas import UserCreate
from app.core.security import get_password_hash

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalars().first()


async def create_user(db: AsyncSession, user_in: UserCreate):
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(user)
    await db.flush()

    if user.role == UserRole.CLIENT:
        client = Client(user_id=user.id)
        db.add(client)

    elif user.role == UserRole.DOCTOR:
        # Для доктора профиль обычно создается админом отдельно,
        # либо создаем "заготовку", но без специализации это может вызвать ошибку,
        # если специализация обязательна.
        # Пока можно пропустить или требовать создание через админку.
        pass

    await db.commit()
    await db.refresh(user)
    return user