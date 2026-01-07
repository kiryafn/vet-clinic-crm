from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from app.core.db import get_db
from app.users.dependencies import get_current_user
from app.users.models import User, UserRole
from app.appointments import schemas, service
from app.clients.service import get_client_by_user_id

router = APIRouter()

@router.post("/", response_model=schemas.AppointmentRead)
async def create_appointment(
    appointment_in: schemas.AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.CLIENT:
        # Assuming only clients book for themselves for now, or admins?
        # If admin books, logic might differ. For now strict to Client booking.
        raise HTTPException(status_code=403, detail="Only clients can book appointments")

    client = await get_client_by_user_id(db, current_user.id)
    if not client:
        raise HTTPException(status_code=404, detail="Client profile not found")

    return await service.create_appointment(db, appointment_in, client_id=client.id)

@router.get("/", response_model=List[schemas.AppointmentRead])
async def read_appointments(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Role-based filtering
    filter_by = {}
    if current_user.role == UserRole.CLIENT:
        client = await get_client_by_user_id(db, current_user.id)
        if client:
            filter_by['client_id'] = client.id
        else:
            return [] # No profile, no appointments
    elif current_user.role == UserRole.DOCTOR:
        from app.doctors.service import get_doctor_by_user_id
        doctor = await get_doctor_by_user_id(db, current_user.id)
        if doctor:
            filter_by['doctor_id'] = doctor.id
        else:
            return []
    
    return await service.get_appointments(db, skip=skip, limit=limit, filters=filter_by)

from datetime import datetime, date as date_type

@router.get("/slots", response_model=List[datetime])
async def get_available_slots(
    doctor_id: int,
    date: date_type,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Convert date to datetime at midnight
    dt = datetime.combine(date, datetime.min.time())
    return await service.get_day_slots(db, doctor_id, dt)

@router.get("/{appointment_id}", response_model=schemas.AppointmentRead)
async def read_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = await service.get_appointment(db, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment