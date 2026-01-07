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


async def get_available_slots(db: AsyncSession, doctor_id: int, date: datetime) -> list[datetime]:
    """
    Возвращает список доступных временных слотов для доктора на указанную дату.
    Рабочие часы: 9:00 - 17:00, длительность приема: 45 минут.
    Возвращает datetime объекты с timezone UTC.
    """
    # Нормализуем дату (начало дня в UTC)
    date_utc = ensure_utc(date)
    # Создаем начало дня в UTC
    date_start_utc = date_utc.replace(hour=0, minute=0, second=0, microsecond=0)
    date_end_utc = date_start_utc + timedelta(days=1)
    
    # Конвертируем в naive для запроса к БД (если БД хранит naive UTC)
    date_start_naive = ensure_naive_utc(date_start_utc)
    date_end_naive = ensure_naive_utc(date_end_utc)
    
    # Рабочие часы: 9:00 - 17:00
    WORK_START_HOUR = 9
    WORK_END_HOUR = 17
    
    # Получаем все записи доктора на этот день (кроме отмененных)
    # Используем UTC для сравнения, так как БД может хранить timezone-aware datetime
    date_start_utc_for_query = date_start_utc
    date_end_utc_for_query = date_end_utc
    
    stmt = select(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status != "cancelled",
        Appointment.date_time >= date_start_utc_for_query,
        Appointment.date_time < date_end_utc_for_query
    )
    result = await db.execute(stmt)
    existing_appointments = result.scalars().all()
    
    # Создаем множество занятых временных слотов (в naive UTC для сравнения)
    booked_slots = set()
    for appt in existing_appointments:
        # Приводим к naive UTC для сравнения
        appt_start_naive = ensure_naive_utc(appt.date_time)
        booked_slots.add(appt_start_naive)
    
    # Генерируем все возможные слоты в рабочие часы
    available_slots = []
    # Начинаем с 9:00 UTC для указанной даты
    current_time_naive = date_start_naive.replace(hour=WORK_START_HOUR, minute=0)
    work_end_naive = date_start_naive.replace(hour=WORK_END_HOUR, minute=0)
    
    # Текущее время в UTC (naive для сравнения)
    now_utc_naive = ensure_naive_utc(datetime.now(timezone.utc))
    
    while current_time_naive < work_end_naive:
        # Проверяем, что слот не занят и не в прошлом
        if current_time_naive not in booked_slots and current_time_naive > now_utc_naive:
            # Возвращаем с timezone UTC
            slot_utc = current_time_naive.replace(tzinfo=timezone.utc)
            available_slots.append(slot_utc)
        current_time_naive += APPOINTMENT_DURATION
    
    return available_slots