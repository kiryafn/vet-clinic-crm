import sys
import os
import asyncio

sys.path.append(os.getcwd())

from sqlalchemy import select
from app.core.db import Base, async_session_factory, engine, AsyncSession
from app.doctors.models import Specialization
from app.users.models import User, UserRole
from app.pets.models import Pet
from app.core.security import get_password_hash


async def init_db(db: AsyncSession):
    result = await db.execute(select(Specialization))
    if not result.scalars().first():
        specs = [
            Specialization(
                name_ru="Терапевт", name_en="General Practitioner",
                description_ru="Общий осмотр и лечение", description_en="General checkup and treatment"
            ),
            Specialization(
                name_ru="Хирург", name_en="Surgeon",
                description_ru="Оперативное вмешательство", description_en="Surgical operations"
            ),
            Specialization(
                name_ru="Офтальмолог", name_en="Ophthalmologist",
                description_ru="Лечение глаз", description_en="Eye treatment"
            ),
            Specialization(
                name_ru="Дерматолог", name_en="Dermatologist",
                description_ru="Лечение кожи", description_en="Skin treatment"
            ),
            Specialization(
                name_ru="Ратолог", name_en="Exotic Animal Vet",
                description_ru="Специалист по грызунам", description_en="Specialist in rodents and exotic animals"
            ),
        ]
        db.add_all(specs)
        await db.commit()
        print("✅ Специализации добавлены!")
    else:
        print("⚠️ Специализации уже есть.")

    admin_email = "admin@vet.com"
    result = await db.execute(select(User).filter(User.email == admin_email))
    if not result.scalars().first():
        admin = User(
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            full_name="Super Admin",
            role=UserRole.ADMIN,
            phone_number="+0000000000"
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