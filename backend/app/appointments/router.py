from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from app.core.db import get_db
from app.users.dependencies import get_current_user
from app.users.models import User
from app.appointments import schemas, service

router = APIRouter()

@router.post("/", response_model=schemas.AppointmentRead)
async def create_appointment(
    appointment_in: schemas.AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await service.create_appointment(db, appointment_in)

@router.get("/", response_model=List[schemas.AppointmentRead])
async def read_appointments(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await service.get_appointments(db, skip=skip, limit=limit)

@router.get("/slots", response_model=List[datetime])
async def get_available_slots(
    doctor_id: int,
    date: datetime,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await service.get_day_slots(db, doctor_id, date)

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