from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.appointments.models import Appointment
from app.appointments.schemas import AppointmentCreate
from fastapi import HTTPException

APPOINTMENT_DURATION = timedelta(minutes=45)


def ensure_utc(dt: datetime) -> datetime:

    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def ensure_naive_utc(dt: datetime) -> datetime:

    return ensure_utc(dt).replace(tzinfo=None)


async def check_availability(db: AsyncSession, doctor_id: int, new_time: datetime) -> bool:
    new_start = ensure_naive_utc(new_time)
    new_end = new_start + APPOINTMENT_DURATION

    stmt = select(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status != "cancelled"
    )
    result = await db.execute(stmt)
    existing_appointments = result.scalars().all()

    for appt in existing_appointments:
        appt_start = ensure_naive_utc(appt.date_time)
        appt_end = appt_start + APPOINTMENT_DURATION

        if new_start < appt_end and new_end > appt_start:
            return False

    return True


async def get_day_slots(db: AsyncSession, doctor_id: int, date: datetime) -> list[datetime]:
    target_date = ensure_naive_utc(date)
    
    start_of_day = target_date.replace(hour=9, minute=0, second=0, microsecond=0)
    end_of_day = target_date.replace(hour=18, minute=0, second=0, microsecond=0)

    search_start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    search_end = search_start + timedelta(days=1)
    
    stmt = select(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status != "cancelled",
        Appointment.date_time >= search_start,
        Appointment.date_time < search_end
        # Note: If DB stores Aware strings (with +00:00), this comparison with Naive might fail in strict SQL.
        # But SQLite usually compares strings. 
        # Ideally we should match what is in DB.
        # Given we use ensure_naive_utc for write, sticking to Naive is safest for SQLite.
    )
    result = await db.execute(stmt)
    existing_appointments = result.scalars().all()

    available_slots = []
    current_slot = start_of_day

    # Генерируем слоты пока помещаемся в рабочий день
    while current_slot + APPOINTMENT_DURATION <= end_of_day:
        is_free = True
        slot_end = current_slot + APPOINTMENT_DURATION

        # Проверяем пересечения с существующими записями
        for appt in existing_appointments:
            appt_start = ensure_naive_utc(appt.date_time)
            appt_end = appt_start + APPOINTMENT_DURATION

            # Если есть пересечение
            if current_slot < appt_end and slot_end > appt_start:
                is_free = False
                break

        if is_free:
            # Return as Aware UTC ISO string for frontend? 
            # Or just return datetime, FastAPI serializes it.
            # Let's keep it Naive UTC here, but maybe add TZ before return if needed.
            # Actually, frontend likes ISO with 'Z'.
            available_slots.append(current_slot.replace(tzinfo=timezone.utc))

        current_slot += APPOINTMENT_DURATION

    return available_slots


async def create_appointment(db: AsyncSession, appointment_in: AppointmentCreate, client_id: int):
    # Ensure Naive UTC storage
    appt_time = ensure_naive_utc(appointment_in.date_time)

    # Check using naive time
    is_available = await check_availability(db, appointment_in.doctor_id, appt_time)
    if not is_available:
        raise HTTPException(status_code=409, detail="This time slot is already booked")

    # Создаем объект
    data = appointment_in.model_dump(exclude={"date_time", "reason"})
    db_appointment = Appointment(
        **data,
        date_time=appt_time,
        client_id=client_id,
        reason=appointment_in.reason or "No description provided"
    )

    db.add(db_appointment)
    await db.commit()
    # Eager load relationships for the response schema
    query = select(Appointment).filter(Appointment.id == db_appointment.id).options(
        selectinload(Appointment.client),
        selectinload(Appointment.doctor),
        selectinload(Appointment.pet)
    )
    result = await db.execute(query)
    return result.scalars().first()


async def get_appointments(db: AsyncSession, skip: int = 0, limit: int = 100, filters: dict = None):
    query = select(Appointment)
    
    if filters:
        for attr, value in filters.items():
            query = query.filter(getattr(Appointment, attr) == value)
            
    # Eager load relationships for display
    query = query.options(
        selectinload(Appointment.client),
        selectinload(Appointment.doctor),
        selectinload(Appointment.pet)
    ).order_by(Appointment.date_time.asc())
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


async def get_appointment(db: AsyncSession, appointment_id: int):
    result = await db.execute(select(Appointment).filter(Appointment.id == appointment_id))
    return result.scalars().first()


async def cancel_appointment(db: AsyncSession, appointment_id: int):
    appointment = await get_appointment(db, appointment_id)
    if not appointment:
        return None
    
    appointment.cancel()
    await db.commit()
    await db.refresh(appointment)
    return appointment