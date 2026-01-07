import sys
import os
import asyncio
from datetime import datetime, date, timedelta, timezone

sys.path.append(os.getcwd())

from sqlalchemy import select
from app.core.db import Base, async_session_factory, engine, AsyncSession
from app.doctors.models import DoctorSpecialization, Doctor
from app.users.models import User, UserRole
from app.pets.models import Pet, PetSpecies
from app.clients.models import Client
from app.appointments.models import Appointment, AppointmentStatus
from app.core.security import get_password_hash


async def init_db(db: AsyncSession):
    # Создание админа
    admin_email = "admin@vet.com"
    result = await db.execute(select(User).filter(User.email == admin_email))
    if not result.scalars().first():
        admin = User(
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        await db.commit()
        print(f"✅ Супер-Админ создан: {admin_email} / admin123")
    else:
        print("⚠️ Админ уже существует.")

    # Проверяем, есть ли уже тестовые данные
    result = await db.execute(select(Doctor))
    existing_doctors = result.scalars().all()
    if len(existing_doctors) > 0:  # Уже есть доктора
        print("⚠️ Тестовые данные уже существуют, пропускаем создание.")
        return

    print("\n📝 Создание тестовых данных...")

    # Создание докторов
    doctors_data = [
        {
            "email": "ivanov@vet.com",
            "password": "doctor123",
            "full_name": "Иван Иванов",
            "specialization": DoctorSpecialization.THERAPIST,
            "experience_years": 10,
            "phone_number": "+380501234567",
            "bio": "Опытный ветеринар-терапевт с 10-летним стажем. Специализируюсь на лечении собак и кошек.",
            "price": 500
        },
        {
            "email": "petrova@vet.com",
            "password": "doctor123",
            "full_name": "Мария Петрова",
            "specialization": DoctorSpecialization.SURGEON,
            "experience_years": 8,
            "phone_number": "+380501234568",
            "bio": "Ветеринарный хирург. Выполняю операции любой сложности.",
            "price": 800
        },
        {
            "email": "sidorov@vet.com",
            "password": "doctor123",
            "full_name": "Алексей Сидоров",
            "specialization": DoctorSpecialization.DENTIST,
            "experience_years": 5,
            "phone_number": "+380501234569",
            "bio": "Ветеринарный стоматолог. Уход за зубами ваших питомцев.",
            "price": 600
        },
        {
            "email": "kozlov@vet.com",
            "password": "doctor123",
            "full_name": "Дмитрий Козлов",
            "specialization": DoctorSpecialization.CARDIOLOGIST,
            "experience_years": 12,
            "phone_number": "+380501234570",
            "bio": "Ветеринарный кардиолог. Диагностика и лечение заболеваний сердца.",
            "price": 700
        },
        {
            "email": "volkova@vet.com",
            "password": "doctor123",
            "full_name": "Анна Волкова",
            "specialization": DoctorSpecialization.DERMATOLOGIST,
            "experience_years": 7,
            "phone_number": "+380501234571",
            "bio": "Ветеринарный дерматолог. Лечение кожных заболеваний у животных.",
            "price": 550
        }
    ]

    created_doctors = []
    for doc_data in doctors_data:
        # Создаем User
        user = User(
            email=doc_data["email"],
            password_hash=get_password_hash(doc_data["password"]),
            role=UserRole.DOCTOR,
        )
        db.add(user)
        await db.flush()

        # Создаем Doctor
        doctor = Doctor(
            user_id=user.id,
            full_name=doc_data["full_name"],
            specialization=doc_data["specialization"],
            experience_years=doc_data["experience_years"],
            phone_number=doc_data["phone_number"],
            bio=doc_data["bio"],
            price=doc_data["price"]
        )
        db.add(doctor)
        await db.flush()
        created_doctors.append(doctor)
        print(f"  ✅ Доктор создан: {doc_data['full_name']} ({doc_data['email']} / {doc_data['password']})")

    await db.commit()

    # Создание клиентов
    clients_data = [
        {
            "email": "client1@example.com",
            "password": "client123",
            "full_name": "Ольга Новикова",
            "phone_number": "+380501111111",
            "address": "ул. Главная, 15, г. Киев"
        },
        {
            "email": "client2@example.com",
            "password": "client123",
            "full_name": "Петр Смирнов",
            "phone_number": "+380502222222",
            "address": "пр. Победы, 42, г. Харьков"
        },
        {
            "email": "client3@example.com",
            "password": "client123",
            "full_name": "Елена Кузнецова",
            "phone_number": "+380503333333",
            "address": "ул. Шевченко, 8, г. Одесса"
        },
        {
            "email": "client4@example.com",
            "password": "client123",
            "full_name": "Андрей Морозов",
            "phone_number": "+380504444444",
            "address": "ул. Леси Украинки, 25, г. Львов"
        }
    ]

    created_clients = []
    for client_data in clients_data:
        # Создаем User
        user = User(
            email=client_data["email"],
            password_hash=get_password_hash(client_data["password"]),
            role=UserRole.CLIENT,
        )
        db.add(user)
        await db.flush()

        # Создаем Client
        client = Client(
            user_id=user.id,
            full_name=client_data["full_name"],
            phone_number=client_data["phone_number"],
            address=client_data["address"]
        )
        db.add(client)
        await db.flush()
        created_clients.append(client)
        print(f"  ✅ Клиент создан: {client_data['full_name']} ({client_data['email']} / {client_data['password']})")

    await db.commit()

    # Создание питомцев
    pets_data = [
        {"name": "Бобик", "species": PetSpecies.DOG, "breed": "Немецкая овчарка", "birth_date": date(2019, 5, 15), "owner_idx": 0},
        {"name": "Мурка", "species": PetSpecies.CAT, "breed": "Британская короткошерстная", "birth_date": date(2020, 3, 20), "owner_idx": 0},
        {"name": "Рекс", "species": PetSpecies.DOG, "breed": "Лабрадор", "birth_date": date(2021, 7, 10), "owner_idx": 1},
        {"name": "Барсик", "species": PetSpecies.CAT, "breed": "Персидская", "birth_date": date(2018, 11, 5), "owner_idx": 1},
        {"name": "Чарли", "species": PetSpecies.DOG, "breed": "Бигль", "birth_date": date(2022, 1, 8), "owner_idx": 2},
        {"name": "Снежок", "species": PetSpecies.RABBIT, "breed": "Ангорский", "birth_date": date(2021, 6, 12), "owner_idx": 2},
        {"name": "Джек", "species": PetSpecies.DOG, "breed": "Йоркширский терьер", "birth_date": date(2020, 9, 25), "owner_idx": 3},
        {"name": "Вася", "species": PetSpecies.CAT, "breed": "Мейн-кун", "birth_date": date(2019, 4, 18), "owner_idx": 3},
    ]

    created_pets = []
    for pet_data in pets_data:
        pet = Pet(
            name=pet_data["name"],
            species=pet_data["species"],
            breed=pet_data["breed"],
            birth_date=pet_data["birth_date"],
            owner_id=created_clients[pet_data["owner_idx"]].id
        )
        db.add(pet)
        await db.flush()
        created_pets.append(pet)
        print(f"  ✅ Питомец создан: {pet_data['name']} ({pet_data['breed']})")

    await db.commit()

    # Создание записей
    now = datetime.now(timezone.utc)
    appointments_data = [
        {"date_time": now + timedelta(days=1, hours=10), "doctor_idx": 0, "client_idx": 0, "pet_idx": 0, "reason": "Плановый осмотр", "status": AppointmentStatus.PLANNED},
        {"date_time": now + timedelta(days=1, hours=14), "doctor_idx": 0, "client_idx": 1, "pet_idx": 2, "reason": "Вакцинация", "status": AppointmentStatus.PLANNED},
        {"date_time": now + timedelta(days=2, hours=11), "doctor_idx": 1, "client_idx": 0, "pet_idx": 0, "reason": "Консультация перед операцией", "status": AppointmentStatus.PLANNED},
        {"date_time": now + timedelta(days=3, hours=9), "doctor_idx": 2, "client_idx": 2, "pet_idx": 4, "reason": "Чистка зубов", "status": AppointmentStatus.PLANNED},
        {"date_time": now + timedelta(days=3, hours=15), "doctor_idx": 3, "client_idx": 1, "pet_idx": 2, "reason": "Проверка сердца", "status": AppointmentStatus.PLANNED},
        {"date_time": now + timedelta(days=4, hours=10), "doctor_idx": 4, "client_idx": 3, "pet_idx": 6, "reason": "Кожная сыпь", "status": AppointmentStatus.PLANNED},
        {"date_time": now - timedelta(days=5, hours=14), "doctor_idx": 0, "client_idx": 0, "pet_idx": 1, "reason": "Плановый осмотр", "status": AppointmentStatus.COMPLETED, "doctor_notes": "Все хорошо, питомец здоров."},
        {"date_time": now - timedelta(days=3, hours=10), "doctor_idx": 1, "client_idx": 2, "pet_idx": 5, "reason": "Стерилизация", "status": AppointmentStatus.COMPLETED, "doctor_notes": "Операция прошла успешно, восстановление нормальное."},
        {"date_time": now - timedelta(days=2, hours=16), "doctor_idx": 2, "client_idx": 1, "pet_idx": 3, "reason": "Лечение зубов", "status": AppointmentStatus.COMPLETED, "doctor_notes": "Удален кариес, зубная боль прошла."},
        {"date_time": now + timedelta(days=5, hours=12), "doctor_idx": 0, "client_idx": 3, "pet_idx": 7, "reason": "Плановый осмотр", "status": AppointmentStatus.PLANNED},
    ]

    for apt_data in appointments_data:
        appointment = Appointment(
            date_time=apt_data["date_time"],
            doctor_id=created_doctors[apt_data["doctor_idx"]].id,
            client_id=created_clients[apt_data["client_idx"]].id,
            pet_id=created_pets[apt_data["pet_idx"]].id,
            reason=apt_data["reason"],
            status=apt_data["status"],
            doctor_notes=apt_data.get("doctor_notes")
        )
        db.add(appointment)

    await db.commit()
    print(f"\n✅ Тестовые данные созданы:")
    print(f"   - Докторов: {len(created_doctors)}")
    print(f"   - Клиентов: {len(created_clients)}")
    print(f"   - Питомцев: {len(created_pets)}")
    print(f"   - Записей: {len(appointments_data)}")

async def setup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        await init_db(db)

if __name__ == "__main__":
    asyncio.run(setup())