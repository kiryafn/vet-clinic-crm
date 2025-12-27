from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.users.dependencies import get_current_admin
from app.users.models import User, UserRole
from app.users.service import get_user_by_email
from app.core.security import get_password_hash
from app.doctors import models, schemas

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_doctor(
        doctor_in: schemas.DoctorCreate,
        db: Session = Depends(get_db),
        admin: User = Depends(get_current_admin)
):
    if get_user_by_email(db, doctor_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    spec = db.get(models.Specialization, doctor_in.specialization_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Specialization not found")

    try:
        db_user = User(
            email=doctor_in.email,
            password_hash=get_password_hash(doctor_in.password),
            full_name=doctor_in.full_name,
            phone_number=doctor_in.phone_number,
            role=UserRole.DOCTOR
        )
        db.add(db_user)
        db.flush()

        db_doctor = models.Doctor(
            user_id=db_user.id,
            specialization_id=doctor_in.specialization_id,
            experience_years=doctor_in.experience_years,
            price=doctor_in.price,
            bio=doctor_in.bio
        )
        db.add(db_doctor)

        db.commit()
        return {"status": "success", "doctor_id": db_doctor.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))