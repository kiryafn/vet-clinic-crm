from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from app.core.db import get_db, SessionDep
from app.users.dependencies import get_current_user
from app.users.models import User, UserRole
from app.appointments import schemas, service
from app.clients.service import get_client_by_user_id

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# Кастомная схема ответа для пагинации
from pydantic import BaseModel


class PaginatedAppointments(BaseModel):
    items: List[schemas.AppointmentRead]
    total: int


@router.post("/", response_model=schemas.AppointmentRead)
async def create_appointment(
        appointment_in: schemas.AppointmentCreate,
        db: SessionDep,
        current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Only clients can book appointments")

    client = await get_client_by_user_id(db, current_user.id)
    if not client:
        raise HTTPException(status_code=404, detail="Client profile not found")

    return await service.create_appointment(db, appointment_in, client_id=client.id)


@router.get("/", response_model=PaginatedAppointments)
async def read_appointments(
        db: SessionDep,
        page: int = 1,
        limit: int = 100,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        current_user: User = Depends(get_current_user),
):
    """
    Получить список записей.
    - Если переданы start_date и end_date -> работает как режим Календаря (фильтр по дате).
    - Если даты не переданы -> работает как режим Списка (пагинация).
    """
    filters = {}

    # Если это клиент - показываем только его записи
    if current_user.role == UserRole.CLIENT:
        client = await get_client_by_user_id(db, current_user.id)
        if client:
            filters["client_id"] = client.id

    # Если доктор - показываем только его записи
    elif current_user.role == UserRole.DOCTOR:
        # Предполагаем, что у User есть doctor_profile или мы ищем доктора по user_id
        # Для простоты пока оставим фильтр по user_id доктора, если он есть в модели,
        # или нужно найти ID доктора. Допустим, доктор видит всё или свои.
        # Пока оставим без доп фильтра, если логика доктора не реализована до конца.
        pass

    skip = (page - 1) * limit

    # Если мы в режиме календаря (есть даты), то limit можно сделать большим,
    # чтобы загрузить все события месяца
    if start_date and end_date:
        limit = 1000
        skip = 0

    items, total = await service.get_appointments(
        db,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
        filters=filters
    )

    return {"items": items, "total": total}


@router.get("/slots", response_model=List[str])
async def get_available_slots(
        db: SessionDep,
        doctor_id: int = Query(..., description="Doctor ID"),
        date: str = Query(..., description="Date in YYYY-MM-DD format"),
):
    """
    Получить доступные временные слоты для доктора на указанную дату.
    Возвращает список ISO строк с доступными временами начала приема.
    Endpoint публичный (не требует аутентификации) для удобства бронирования.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Парсим дату из строки YYYY-MM-DD и добавляем UTC timezone
        from datetime import timezone
        date_obj = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        logger.info(f"Getting slots for doctor_id={doctor_id}, date={date}")
    except ValueError as e:
        logger.error(f"Invalid date format: {date}, error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid date format. Use YYYY-MM-DD. Error: {str(e)}")
    
    try:
        slots = await service.get_available_slots(db, doctor_id, date_obj)
        logger.info(f"Found {len(slots)} available slots for doctor_id={doctor_id}, date={date}")
        # Возвращаем ISO строки в UTC формате
        result = [slot.isoformat() for slot in slots]
        logger.debug(f"Slots: {result}")
        return result
    except Exception as e:
        # Логируем ошибку для отладки
        logger.error(f"Error getting slots for doctor_id={doctor_id}, date={date}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting available slots: {str(e)}")


@router.get("/{appointment_id}", response_model=schemas.AppointmentRead)
async def read_appointment(
        appointment_id: int,
        db: SessionDep,
        current_user: User = Depends(get_current_user),
):
    appointment = await service.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.put("/{appointment_id}/cancel", response_model=schemas.AppointmentRead)
async def cancel_appointment(
        appointment_id: int,
        db: SessionDep,
        current_user: User = Depends(get_current_user),
):
    # Тут можно добавить проверку прав (может ли юзер отменить ЭТУ запись)
    appointment = await service.cancel_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment