from sqlalchemy.ext.asyncio import AsyncSession
from app.users.models import User, UserRole
from app.doctors.models import Doctor, Specialization
from app.doctors.schemas import DoctorCreate
from app.core.security import get_password_hash

async def create_doctor(db: AsyncSession, doctor_in: DoctorCreate) -> Doctor:
    # User creation handled here transactionally
    db_user = User(
        email=doctor_in.email,
        password_hash=get_password_hash(doctor_in.password),
        full_name=doctor_in.full_name,
        phone_number=doctor_in.phone_number,
        role=UserRole.DOCTOR
    )
    db.add(db_user)
    await db.flush() # to get user.id

    db_doctor = Doctor(
        user_id=db_user.id,
        specialization_id=doctor_in.specialization_id,
        experience_years=doctor_in.experience_years,
        price=doctor_in.price,
        bio=doctor_in.bio
    )
    db.add(db_doctor)
    await db.commit()
    await db.refresh(db_doctor)
    return db_doctor


async def get_doctors(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Doctor]:
    from sqlalchemy import select
    # Eager load user relationship to get names, etc.
    from sqlalchemy.orm import selectinload
    
    query = select(Doctor).options(selectinload(Doctor.user), selectinload(Doctor.specialization)).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
