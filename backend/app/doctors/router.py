from fastapi import APIRouter, Depends, HTTPException, status

from app.core.db import SessionDep
from app.users.dependencies import get_current_admin
from app.users.models import User
from app.doctors import schemas, service

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.DoctorRead)
async def create_doctor(
        doctor_in: schemas.DoctorCreate,
        db: SessionDep,
        admin: User = Depends(get_current_admin)
):
    """Create a new doctor. Admin only."""
    return await service.create_doctor(db, doctor_in)


@router.get("/", response_model=list[schemas.DoctorRead])
async def get_doctors(
    db: SessionDep,
    skip: int = 0,
    limit: int = 100
):
    return await service.get_doctors(db, skip=skip, limit=limit)


@router.get("/{doctor_id}", response_model=schemas.DoctorRead)
async def get_doctor(
    doctor_id: int,
    db: SessionDep,
    admin: User = Depends(get_current_admin)
):
    doctor = await service.get_doctor_by_id(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@router.patch("/{doctor_id}", response_model=schemas.DoctorRead)
async def update_doctor(
    doctor_id: int,
    doctor_update: schemas.DoctorUpdate,
    db: SessionDep,
    admin: User = Depends(get_current_admin)
):
    """Update a doctor. Admin only."""
    return await service.update_doctor_or_404(db, doctor_id, doctor_update)


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor(
    doctor_id: int,
    db: SessionDep,
    admin: User = Depends(get_current_admin)
):
    """Delete a doctor. Admin only."""
    await service.delete_doctor_or_404(db, doctor_id)