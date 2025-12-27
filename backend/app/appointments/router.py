from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload  # <--- Важный импорт

from app.core.db import SessionDep
from app.users.dependencies import CurrentUser
from app.appointments import schemas, models
from app.pets.models import Pet
from app.doctors.models import Doctor

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/", response_model=schemas.AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(
        appointment_in: schemas.AppointmentCreate,
        db: SessionDep,
        current_user: CurrentUser
):
    doctor = db.get(Doctor, appointment_in.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    pet = db.query(Pet).filter(
        Pet.id == appointment_in.pet_id,
        Pet.owner_id == current_user.id
    ).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found or not yours")

    db_appointment = models.Appointment(
        user_id=current_user.id,
        doctor_id=appointment_in.doctor_id,
        pet_id=appointment_in.pet_id,
        date_time=appointment_in.date_time,
        user_description=appointment_in.user_description
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)

    return db.query(models.Appointment).filter(models.Appointment.id == db_appointment.id) \
        .options(
        joinedload(models.Appointment.doctor).joinedload(Doctor.user),
        joinedload(models.Appointment.doctor).joinedload(Doctor.specialization),
        joinedload(models.Appointment.pet),
        joinedload(models.Appointment.user)
    ).first()


@router.get("/", response_model=list[schemas.AppointmentRead])
def get_my_appointments(
        db: SessionDep,
        current_user: CurrentUser
):
    return db.query(models.Appointment) \
        .filter(models.Appointment.user_id == current_user.id) \
        .options(
        joinedload(models.Appointment.doctor).joinedload(Doctor.user),
        joinedload(models.Appointment.doctor).joinedload(Doctor.specialization),
        joinedload(models.Appointment.pet),
        joinedload(models.Appointment.user)
    ).all()