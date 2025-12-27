from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.appointments.models import Appointment
from app.appointments.schemas import AppointmentCreate, AppointmentUpdate
from app.doctors.models import Doctor
from app.pets.models import Pet
from app.users.models import User

async def check_availability(db: AsyncSession, doctor_id: int, date_time: datetime) -> bool:
    # Check if doctor has any appointment at this time
    # This is a simple check. Real world would need duration check.
    result = await db.execute(select(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.date_time == date_time
    ))
    return result.scalars().first() is None

async def create_appointment(db: AsyncSession, appointment_in: AppointmentCreate, user_id: int) -> Appointment:
    # Check doctor
    doctor = await db.get(Doctor, appointment_in.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Check pet
    result = await db.execute(select(Pet).filter(
        Pet.id == appointment_in.pet_id,
        Pet.owner_id == user_id
    ))
    pet = result.scalars().first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found or not yours")

    # Check availability
    if not await check_availability(db, appointment_in.doctor_id, appointment_in.date_time):
        raise HTTPException(status_code=400, detail="Doctor is not available at this time")

    db_appointment = Appointment(
        user_id=user_id,
        doctor_id=appointment_in.doctor_id,
        pet_id=appointment_in.pet_id,
        date_time=appointment_in.date_time,
        user_description=appointment_in.user_description
    )
    db.add(db_appointment)
    await db.commit()
    await db.refresh(db_appointment)

    # Reload with relations for response
    return await get_appointment_by_id(db, db_appointment.id)

async def get_appointment_by_id(db: AsyncSession, appointment_id: int) -> Appointment | None:
    query = select(Appointment).filter(Appointment.id == appointment_id).options(
        joinedload(Appointment.doctor).joinedload(Doctor.user),
        joinedload(Appointment.doctor).joinedload(Doctor.specialization),
        joinedload(Appointment.pet),
        joinedload(Appointment.user)
    )
    result = await db.execute(query)
    return result.scalars().first()

async def get_my_appointments(db: AsyncSession, user_id: int) -> list[Appointment]:
    query = select(Appointment).filter(Appointment.user_id == user_id).options(
        joinedload(Appointment.doctor).joinedload(Doctor.user),
        joinedload(Appointment.doctor).joinedload(Doctor.specialization),
        joinedload(Appointment.pet),
        joinedload(Appointment.user)
    )
    result = await db.execute(query)
    return result.unique().scalars().all()

async def get_doctor_appointments(db: AsyncSession, doctor_id: int) -> list[Appointment]:
    query = select(Appointment).filter(Appointment.doctor_id == doctor_id).options(
        joinedload(Appointment.doctor).joinedload(Doctor.user),
        joinedload(Appointment.doctor).joinedload(Doctor.specialization),
        joinedload(Appointment.pet),
        joinedload(Appointment.user)
    )
    result = await db.execute(query)
    return result.unique().scalars().all()

async def update_doctor_notes(
    db: AsyncSession, 
    appointment_id: int, 
    notes: str,
    doctor_id: int
) -> Appointment:
    appointment = await get_appointment_by_id(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.doctor_id != doctor_id:
         raise HTTPException(status_code=403, detail="Not your appointment")

    appointment.doctor_notes = notes
    await db.commit()
    await db.refresh(appointment)
    return appointment
