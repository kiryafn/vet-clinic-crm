from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel

from app.core.db import SessionDep
from app.users.dependencies import get_current_user, get_current_admin
from app.users.models import User
from app.appointments import schemas, service

router = APIRouter(prefix="/appointments", tags=["Appointments"])


class PaginatedAppointments(BaseModel):
    items: List[schemas.AppointmentRead]
    total: int


@router.post("/", response_model=schemas.AppointmentRead)
async def create_appointment(
        appointment_in: schemas.AppointmentCreate,
        db: SessionDep,
        current_user: User = Depends(get_current_user),
):
    """Create a new appointment. Only clients can book appointments."""
    return await service.create_appointment_for_client(db, appointment_in, current_user)


@router.get("/", response_model=PaginatedAppointments)
async def read_appointments(
        db: SessionDep,
        page: int = 1,
        limit: int = 100,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        current_user: User = Depends(get_current_user),
):
    items, total = await service.get_appointments_for_user(
        db,
        current_user,
        page,
        limit,
        start_date,
        end_date
    )
    return {"items": items, "total": total}


@router.get("/slots", response_model=List[str])
async def get_available_slots(
        db: SessionDep,
        doctor_id: int = Query(..., description="Doctor ID"),
        date: str = Query(..., description="Date in YYYY-MM-DD format"),
):
    return await service.get_slots_by_date_string(db, doctor_id, date)


@router.get("/{appointment_id}", response_model=schemas.AppointmentRead)
async def read_appointment(
        appointment_id: int,
        db: SessionDep,
        current_user: User = Depends(get_current_user),
):
    return await service.get_appointment_or_404(db, appointment_id)


@router.put("/{appointment_id}/cancel", response_model=schemas.AppointmentRead)
async def cancel_appointment(
        appointment_id: int,
        db: SessionDep,
        current_user: User = Depends(get_current_user),
):
    return await service.cancel_appointment(db, appointment_id, current_user)


@router.put("/{appointment_id}/complete", response_model=schemas.AppointmentRead)
async def complete_appointment(
        appointment_id: int,
        db: SessionDep,
        current_user: User = Depends(get_current_user),
):
    """Complete an appointment. Only doctors can complete appointments."""
    return await service.complete_appointment(db, appointment_id, current_user)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
        appointment_id: int,
        db: SessionDep,
        admin: User = Depends(get_current_admin),
):
    await service.delete_appointment(db, appointment_id)