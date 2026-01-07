from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import SessionDep
from app.users.dependencies import get_current_admin
from app.users.models import User
from app.users.service import get_user_by_email
from app.doctors import models, schemas, service

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.DoctorRead)
async def create_doctor(
        doctor_in: schemas.DoctorCreate,
        db: SessionDep,
        admin: User = Depends(get_current_admin)
):
    user = await get_user_by_email(db, doctor_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Removed Specialization table lookup since we use Enum now

    try:
        db_doctor = await service.create_doctor(db, doctor_in)
        return db_doctor

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


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
    doctor = await service.update_doctor(db, doctor_id, doctor_update)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor(
    doctor_id: int,
    db: SessionDep,
    admin: User = Depends(get_current_admin)
):
    success = await service.delete_doctor(db, doctor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Doctor not found")