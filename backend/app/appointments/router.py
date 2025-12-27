from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import SessionDep
from app.users.dependencies import CurrentUser, CurrentDoctor
from app.appointments import schemas, service

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/", response_model=schemas.AppointmentRead, status_code=status.HTTP_201_CREATED)
async def create_appointment(
        appointment_in: schemas.AppointmentCreate,
        db: SessionDep,
        current_user: CurrentUser
):
    return await service.create_appointment(db=db, appointment_in=appointment_in, user_id=current_user.id)


@router.get("/", response_model=list[schemas.AppointmentRead])
async def get_my_appointments(
        db: SessionDep,
        current_user: CurrentUser
):
    return await service.get_my_appointments(db=db, user_id=current_user.id)


@router.get("/doctor", response_model=list[schemas.AppointmentRead])
async def get_doctor_appointments(
    db: SessionDep,
    current_doctor: CurrentDoctor
):
    return await service.get_doctor_appointments(db=db, doctor_id=current_doctor.id)


@router.patch("/{appointment_id}/notes", response_model=schemas.AppointmentRead)
async def update_notes(
    appointment_id: int,
    notes_in: schemas.AppointmentUpdate,
    db: SessionDep,
    current_doctor: CurrentDoctor
):
    return await service.update_doctor_notes(
        db=db, 
        appointment_id=appointment_id, 
        notes=notes_in.doctor_notes,
        doctor_id=current_doctor.id
    )