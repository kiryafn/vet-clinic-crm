from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.users.models import User, UserRole
from app.users.service import get_user_by_email
from app.doctors.models import Doctor
from app.doctors.schemas import DoctorCreate, DoctorUpdate
from app.core.security import get_password_hash
from sqlalchemy import select


async def create_doctor(db: AsyncSession, doctor_in: DoctorCreate) -> Doctor:
    """Create a new doctor with user account."""
    # Check if email already exists
    existing_user = await get_user_by_email(db, str(doctor_in.email))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
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
            bio=doctor_in.bio,
            full_name=doctor_in.full_name,
            phone_number=doctor_in.phone_number
        )
        db.add(db_doctor)
        await db.commit()
        await db.refresh(db_doctor)
        return db_doctor
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create doctor: {str(e)}"
        )


async def get_doctors(db: AsyncSession, skip: int = 0, limit: int = 5) -> list[Doctor]:
    query = select(Doctor).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def get_doctor_by_user_id(db: AsyncSession, user_id: int) -> Doctor | None:
    query = select(Doctor).filter(Doctor.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_doctor_by_id(db: AsyncSession, doctor_id: int) -> Doctor | None:
    """Get a doctor by ID. Returns None if not found."""
    query = select(Doctor).filter(Doctor.id == doctor_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_doctor_or_404(db: AsyncSession, doctor_id: int) -> Doctor:
    """Get a doctor by ID. Raises 404 if not found."""
    doctor = await get_doctor_by_id(db, doctor_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    return doctor


async def update_doctor(db: AsyncSession, doctor_id: int, doctor_update: DoctorUpdate) -> Doctor | None:
    """Update a doctor. Returns None if not found."""
    doctor = await get_doctor_by_id(db, doctor_id)
    if not doctor:
        return None
    
    update_data = doctor_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doctor, field, value)
    
    await db.commit()
    await db.refresh(doctor)
    return doctor


async def update_doctor_or_404(
    db: AsyncSession, 
    doctor_id: int, 
    doctor_update: DoctorUpdate
) -> Doctor:
    """Update a doctor. Raises 404 if not found."""
    doctor = await update_doctor(db, doctor_id, doctor_update)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    return doctor


async def delete_doctor(db: AsyncSession, doctor_id: int) -> bool:
    """Delete a doctor. Returns False if not found."""
    query = select(Doctor).filter(Doctor.id == doctor_id)
    result = await db.execute(query)
    doctor = result.scalars().first()
    if doctor:
        await db.delete(doctor)
        await db.commit()
        return True
    return False


async def delete_doctor_or_404(db: AsyncSession, doctor_id: int) -> None:
    """Delete a doctor. Raises 404 if not found."""
    success = await delete_doctor(db, doctor_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
