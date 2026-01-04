from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.appointments.models import Appointment
from app.appointments.schemas import AppointmentCreate
from fastapi import HTTPException

# Константа длительности приема (45 минут)
APPOINTMENT_DURATION = timedelta(minutes=45)


def ensure_utc(dt: datetime) -> datetime:
    """Вспомогательная функция: если дата 'наивная' (без зоны), делаем её UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


async def check_availability(db: AsyncSession, doctor_id: int, new_time: datetime) -> bool:
    """
    Проверяет, свободен ли интервал [new_time, new_time + 45min].
    """
    # 1. Приводим входящее время к UTC
    new_start = ensure_utc(new_time)
    new_end = new_start + APPOINTMENT_DURATION

    # 2. Получаем все активные записи врача
    stmt = select(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status != "cancelled"
    )
    result = await db.execute(stmt)
    existing_appointments = result.scalars().all()

    for appt in existing_appointments:
        # 3. Извлекаем и нормализуем дату из базы
        appt_start = ensure_utc(appt.date_time)
        appt_end = appt_start + APPOINTMENT_DURATION

        # 4. Проверка пересечения интервалов:
        # (StartA < EndB) и (EndA > StartB)
        if new_start < appt_end and new_end > appt_start:
            return False  # Пересечение найдено, слот занят

    return True


async def get_day_slots(db: AsyncSession, doctor_id: int, date: datetime) -> list[datetime]:
    """
    Возвращает список доступных начал приемов (слотов) на указанный день.
    """
    # Нормализуем входящую дату и устанавливаем границы рабочего дня (09:00 - 18:00 UTC)
    target_date = ensure_utc(date)
    start_of_day = target_date.replace(hour=9, minute=0, second=0, microsecond=0)
    end_of_day = target_date.replace(hour=18, minute=0, second=0, microsecond=0)

    # Ищем записи за этот календарный день (00:00 - 23:59)
    search_start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    search_end = search_start + timedelta(days=1)

    stmt = select(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status != "cancelled",
        Appointment.date_time >= search_start,
        Appointment.date_time < search_end
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
            appt_start = ensure_utc(appt.date_time)
            appt_end = appt_start + APPOINTMENT_DURATION

            # Если есть пересечение
            if current_slot < appt_end and slot_end > appt_start:
                is_free = False
                break

        if is_free:
            available_slots.append(current_slot)

        # Шаг сетки: можно сделать равным длительности (45 мин) или меньше (например, 15 или 30 мин)
        # Здесь делаем шаг 45 минут (записи идут стык-в-стык)
        current_slot += APPOINTMENT_DURATION

    return available_slots


async def create_appointment(db: AsyncSession, appointment_in: AppointmentCreate):
    appt_time = ensure_utc(appointment_in.date_time)

    is_available = await check_availability(db, appointment_in.doctor_id, appt_time)
    if not is_available:
        raise HTTPException(status_code=409, detail="This time slot is already booked")

    # Создаем объект, используя время в UTC
    db_appointment = Appointment(
        **appointment_in.model_dump(exclude={"date_time"}),  # Исключаем, чтобы передать явно
        date_time=appt_time
    )

    db.add(db_appointment)
    await db.commit()
    await db.refresh(db_appointment)
    return db_appointment


async def get_appointments(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Appointment).offset(skip).limit(limit))
    return result.scalars().all()


async def get_appointment(db: AsyncSession, appointment_id: int):
    result = await db.execute(select(Appointment).filter(Appointment.id == appointment_id))
    return result.scalars().first()