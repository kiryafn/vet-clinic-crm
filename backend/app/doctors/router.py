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

    spec = await db.get(models.Specialization, doctor_in.specialization_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")

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