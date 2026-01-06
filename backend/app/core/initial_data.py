import sys
import os
import asyncio

sys.path.append(os.getcwd())

from sqlalchemy import select
from app.core.db import Base, async_session_factory, engine, AsyncSession
from app.doctors.models import DoctorSpecialization
from app.users.models import User, UserRole
from app.pets.models import Pet
from app.core.security import get_password_hash


async def init_db(db: AsyncSession):

    admin_email = "admin@vet.com"
    result = await db.execute(select(User).filter(User.email == admin_email))
    if not result.scalars().first():
        admin = User(
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        await db.commit()
        print(f"✅ Супер-Админ создан: {admin_email} / admin123")
    else:
        print("⚠️ Админ уже существует.")

async def setup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        await init_db(db)

if __name__ == "__main__":
    asyncio.run(setup())