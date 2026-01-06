from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.users.models import User

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:

    query = select(User).options(
        selectinload(User.client_profile),
        selectinload(User.doctor_profile)
    ).filter(User.email == email)

    result = await db.execute(query)
    return result.scalars().first()