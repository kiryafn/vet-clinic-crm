from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.users.models import User, UserRole
from app.users.schemas import UserCreate
from app.core.security import get_password_hash

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: UserCreate) -> User:
    password_hash = get_password_hash(user.password)

    db_user = User(
        email=user.email,
        password_hash=password_hash,
        full_name=user.full_name,
        role=UserRole.CLIENT,
        phone_number=user.phone_number,
        address=user.address
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user