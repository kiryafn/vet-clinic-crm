import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.appointments.models import Appointment
from app.appointments.schemas import AppointmentCreate
from app.users.models import User, UserRole
from app.clients.service import get_client_by_user_id

logger = logging.getLogger(__name__)

APPOINTMENT_DURATION = timedelta(minutes=45)


def ensure_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def ensure_naive_utc(dt: datetime) -> datetime:
    return ensure_utc(dt).replace(tzinfo=None)


async def check_availability(db: AsyncSession, doctor_id: int, new_time: datetime) -> bool:
    new_start = ensure_naive_utc(new_time)
    search_start = new_start.replace(hour=0, minute=0, second=0)
    search_end = search_start + timedelta(days=1)

    stmt = select(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status != "cancelled",
        Appointment.date_time >= search_start,
        Appointment.date_time < search_end
    )
    result = await db.execute(stmt)
    existing_appointments = result.scalars().all()

    for appt in existing_appointments:
        appt_start = ensure_naive_utc(appt.date_time)
        appt_end = appt_start + APPOINTMENT_DURATION
        new_end = new_start + APPOINTMENT_DURATION
        if new_start < appt_end and new_end > appt_start:
            return False
    return True


async def create_appointment_for_client(
    db: AsyncSession,
    appointment_in: AppointmentCreate,
    current_user: User
) -> Appointment:
    """Create an appointment for the current client user."""
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can book appointments"
        )
    
    client = await get_client_by_user_id(db, current_user.id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client profile not found"
        )
    
    return await create_appointment(db, appointment_in, client_id=client.id)


async def create_appointment(
    db: AsyncSession, 
    appointment_in: AppointmentCreate, 
    client_id: int
) -> Appointment:
    """Create an appointment (internal use)."""
    appt_time = ensure_naive_utc(appointment_in.date_time)

    is_available = await check_availability(db, appointment_in.doctor_id, appt_time)
    if not is_available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is already booked"
        )

    data = appointment_in.model_dump(exclude={"date_time", "reason"})
    reason_value = appointment_in.reason if appointment_in.reason is not None else "No description provided"

    db_appointment = Appointment(
        **data,
        date_time=appt_time,
        client_id=client_id,
        reason=reason_value
    )
    db.add(db_appointment)
    await db.commit()
    return await get_appointment_or_404(db, db_appointment.id)

async def get_appointments_for_user(
        db: AsyncSession,
        user: User,
        page: int,
        limit: int,
        start_date: Optional[datetime],
        end_date: Optional[datetime]
) -> tuple[List[Appointment], int]:
    """Get appointments for a user. Filters by role (CLIENT sees their appointments, DOCTOR sees their appointments)."""
    from app.doctors.service import get_doctor_by_user_id
    
    query = select(Appointment)

    if user.role == UserRole.CLIENT:
        client = await get_client_by_user_id(db, user.id)
        if client:
            query = query.filter(Appointment.client_id == client.id)
    elif user.role == UserRole.DOCTOR:
        doctor = await get_doctor_by_user_id(db, user.id)
        if doctor:
            query = query.filter(Appointment.doctor_id == doctor.id)

    if start_date and end_date:
        s_date = ensure_naive_utc(start_date)
        e_date = ensure_naive_utc(end_date)
        query = query.filter(and_(Appointment.date_time >= s_date, Appointment.date_time <= e_date))
        skip = 0
        limit = 1000
    else:
        skip = (page - 1) * limit

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    query = query.options(
        selectinload(Appointment.client),
        selectinload(Appointment.doctor),
        selectinload(Appointment.pet)
    ).order_by(Appointment.date_time.asc())

    if limit > 0:
        query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all(), total

async def get_appointment_or_404(db: AsyncSession, appointment_id: int) -> Appointment:
    """Get an appointment by ID. Raises 404 if not found."""
    query = select(Appointment).filter(Appointment.id == appointment_id).options(
        selectinload(Appointment.client),
        selectinload(Appointment.doctor),
        selectinload(Appointment.pet)
    )
    result = await db.execute(query)
    appointment = result.scalars().first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    return appointment


async def cancel_appointment(
    db: AsyncSession, 
    appointment_id: int, 
    current_user: User
) -> Appointment:
    """Cancel an appointment. Only the client who owns the appointment can cancel it."""
    appointment = await get_appointment_or_404(db, appointment_id)
    
    # Only clients can cancel appointments
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can cancel appointments"
        )
    
    client = await get_client_by_user_id(db, current_user.id)
    if not client or appointment.client_id != client.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to cancel this appointment"
        )

    appointment.cancel()
    await db.commit()
    await db.refresh(appointment)
    return appointment


async def complete_appointment(
    db: AsyncSession, 
    appointment_id: int,
    current_user: User
) -> Appointment:
    """Complete an appointment. Only doctors can complete appointments."""
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can complete appointments"
        )
    
    appointment = await get_appointment_or_404(db, appointment_id)
    appointment.complete()
    await db.commit()
    await db.refresh(appointment)
    return appointment

async def delete_appointment(db: AsyncSession, appointment_id: int) -> None:
    """Delete an appointment (admin only)."""
    appointment = await get_appointment_or_404(db, appointment_id)
    await db.delete(appointment)
    await db.commit()

async def get_slots_by_date_string(db: AsyncSession, doctor_id: int, date_str: str) -> List[str]:
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError as e:
        logger.error(f"Invalid date format: {date_str}, error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    try:
        slots = await _calculate_available_slots(db, doctor_id, date_obj)
        return [slot.isoformat() for slot in slots]
    except Exception as e:
        logger.error(f"Error calculating slots: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error calculating slots")


async def _calculate_available_slots(db: AsyncSession, doctor_id: int, date: datetime) -> list[datetime]:
    date_utc = ensure_utc(date)
    date_start = ensure_naive_utc(date_utc.replace(hour=0, minute=0, second=0, microsecond=0))
    date_end = date_start + timedelta(days=1)

    stmt = select(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status != "cancelled",
        Appointment.date_time >= date_start,
        Appointment.date_time < date_end
    )
    result = await db.execute(stmt)
    existing_appointments = result.scalars().all()

    booked_slots = {ensure_naive_utc(appt.date_time) for appt in existing_appointments}
    available_slots = []

    WORK_START = 9
    WORK_END = 17

    current_time = date_start.replace(hour=WORK_START, minute=0)
    end_time = date_start.replace(hour=WORK_END, minute=0)
    now_naive = ensure_naive_utc(datetime.now(timezone.utc))

    while current_time < end_time:
        if current_time not in booked_slots and current_time > now_naive:
            available_slots.append(current_time.replace(tzinfo=timezone.utc))
        current_time += APPOINTMENT_DURATION

    return available_slots