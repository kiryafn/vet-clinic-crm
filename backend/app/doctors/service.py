from sqlalchemy.ext.asyncio import AsyncSession
from app.users.models import User, UserRole
from app.doctors.models import Doctor
from app.doctors.schemas import DoctorCreate
from app.core.security import get_password_hash
from sqlalchemy import select
from sqlalchemy.orm import selectinload


async def create_doctor(db: AsyncSession, doctor_in: DoctorCreate) -> Doctor:
    db_user = User(
        email=str(doctor_in.email),
        password_hash=get_password_hash(doctor_in.password),
        role=UserRole.DOCTOR
    )
    db.add(db_user)
    await db.flush()

    db_doctor = Doctor(
        user_id=db_user.id,
        specialization=doctor_in.specialization,
        experience_years=doctor_in.experience_years,
        price=doctor_in.price,
        bio=doctor_in.bio,
        full_name=doctor_in.full_name,
        phone_number=doctor_in.phone_number
    )
    db.add(db_doctor)
    await db.commit()
    await db.refresh(db_doctor)
    return db_doctor


async def get_doctors(db: AsyncSession, skip: int = 0, limit: int = 5) -> list[Doctor]:
    query = select(Doctor).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def get_doctor_by_user_id(db: AsyncSession, user_id: int) -> Doctor | None:
    query = select(Doctor).filter(Doctor.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().first()
