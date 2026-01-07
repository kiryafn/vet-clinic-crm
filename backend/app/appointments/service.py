from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
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

    # Оптимизация: ищем только в пределах дня, чтобы не перебирать всю базу
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

        if new_start < appt_end and new_end > appt_start:
            return False

    return True


async def create_appointment(db: AsyncSession, appointment_in: AppointmentCreate, client_id: int):
    # Ensure Naive UTC storage
    appt_time = ensure_naive_utc(appointment_in.date_time)

    # Check using naive time
    is_available = await check_availability(db, appointment_in.doctor_id, appt_time)
    if not is_available:
        raise HTTPException(status_code=409, detail="This time slot is already booked")

    # ИСПРАВЛЕНИЕ REASON:
    # 1. Исключаем поля, которые обработаем вручную
    data = appointment_in.model_dump(exclude={"date_time", "reason"})

    # 2. Явно берем reason. Если пришла пустая строка - сохраняем пустую строку.
    # Если None - сохраняем None (или дефолт, если нужно).
    reason_value = appointment_in.reason if appointment_in.reason is not None else "No description provided"

    db_appointment = Appointment(
        **data,
        date_time=appt_time,
        client_id=client_id,
        reason=reason_value
    )

    db.add(db_appointment)
    await db.commit()

    # Подгружаем связи для корректного ответа
    query = select(Appointment).filter(Appointment.id == db_appointment.id).options(
        selectinload(Appointment.client),
        selectinload(Appointment.doctor),
        selectinload(Appointment.pet)
    )
    result = await db.execute(query)
    return result.scalars().first()


async def get_appointments(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        filters: dict = None
):
    """
    Возвращает (items, total_count).
    Поддерживает фильтрацию по датам (для календаря) и пагинацию.
    """
    query = select(Appointment)

    # 1. Фильтры (например, по user_id)
    if filters:
        for attr, value in filters.items():
            if value is not None:
                query = query.filter(getattr(Appointment, attr) == value)

    # 2. Фильтр по датам (для Календаря)
    if start_date and end_date:
        # Приводим к naive UTC, так как в базе храним naive
        s_date = ensure_naive_utc(start_date)
        e_date = ensure_naive_utc(end_date)
        query = query.filter(and_(Appointment.date_time >= s_date, Appointment.date_time <= e_date))

    # 3. Считаем общее количество (до limit/offset)
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    # 4. Подгрузка связей и сортировка
    query = query.options(
        selectinload(Appointment.client),
        selectinload(Appointment.doctor),
        selectinload(Appointment.pet)
    ).order_by(Appointment.date_time.asc())

    # 5. Пагинация (применяем, только если это не режим календаря с полным диапазоном,
    # или если клиент явно запросил пагинацию внутри диапазона)
    # Но обычно календарь грузит всё за месяц, а список - страницами.
    # Если передан limit - применяем.
    if limit > 0:
        query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all(), total


async def get_appointment(db: AsyncSession, appointment_id: int):
    # Добавлен selectinload, чтобы не падало при доступе к client/doctor/pet
    query = select(Appointment).filter(Appointment.id == appointment_id).options(
        selectinload(Appointment.client),
        selectinload(Appointment.doctor),
        selectinload(Appointment.pet)
    )
    result = await db.execute(query)
    return result.scalars().first()


async def cancel_appointment(db: AsyncSession, appointment_id: int):
    appointment = await get_appointment(db, appointment_id)
    if not appointment:
        return None

    appointment.status = "cancelled"  # Предполагаем, что есть поле status или метод cancel()
    # appointment.cancel() # Если есть метод модели

    await db.commit()
    # Возвращаем объект (он уже с подгруженными связями из get_appointment)
    return appointment