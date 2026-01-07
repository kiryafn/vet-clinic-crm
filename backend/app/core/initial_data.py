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
        print(f"✅ Super-Admin created: {admin_email} / admin123")
    else:
        print("⚠️ Admin already exists.")

    result = await db.execute(select(Doctor))
    existing_doctors = result.scalars().all()
    if len(existing_doctors) > 0:
        print("⚠️ Test data already exists, skipping creation.")
        return

    print("\n📝 Creating test data...")

    doctors_data = [
        {
            "email": "smith@vet.com",
            "password": "doctor123",
            "full_name": "John Smith",
            "specialization": DoctorSpecialization.THERAPIST,
            "experience_years": 10,
            "phone_number": "+15550123456",
            "bio": "Experienced general practitioner with 10 years of experience. Specializing in treating dogs and cats."
        },
        {
            "email": "johnson@vet.com",
            "password": "doctor123",
            "full_name": "Sarah Johnson",
            "specialization": DoctorSpecialization.SURGEON,
            "experience_years": 8,
            "phone_number": "+15550123457",
            "bio": "Veterinary surgeon. Performing surgeries of any complexity."
        },
        {
            "email": "brown@vet.com",
            "password": "doctor123",
            "full_name": "Michael Brown",
            "specialization": DoctorSpecialization.DENTIST,
            "experience_years": 5,
            "phone_number": "+15550123458",
            "bio": "Veterinary dentist. Dental care for your pets."
        },
        {
            "email": "wilson@vet.com",
            "password": "doctor123",
            "full_name": "David Wilson",
            "specialization": DoctorSpecialization.CARDIOLOGIST,
            "experience_years": 12,
            "phone_number": "+15550123459",
            "bio": "Veterinary cardiologist. Diagnosis and treatment of heart diseases."
        },
        {
            "email": "davis@vet.com",
            "password": "doctor123",
            "full_name": "Emily Davis",
            "specialization": DoctorSpecialization.DERMATOLOGIST,
            "experience_years": 7,
            "phone_number": "+15550123460",
            "bio": "Veterinary dermatologist. Treatment of skin diseases in animals."
        }
    ]

    created_doctors = []
    for doc_data in doctors_data:
        user = User(
            email=doc_data["email"],
            password_hash=get_password_hash(doc_data["password"]),
            role=UserRole.DOCTOR,
        )
        db.add(user)
        await db.flush()

        doctor = Doctor(
            user_id=user.id,
            full_name=doc_data["full_name"],
            specialization=doc_data["specialization"],
            experience_years=doc_data["experience_years"],
            phone_number=doc_data["phone_number"],
            bio=doc_data["bio"]
        )
        db.add(doctor)
        await db.flush()
        created_doctors.append(doctor)

    await db.commit()

    clients_data = [
        {
            "email": "alice@example.com",
            "password": "client123",
            "full_name": "Alice Cooper",
            "phone_number": "+15551111111",
            "address": "15 Main St, New York, NY"
        },
        {
            "email": "bob@example.com",
            "password": "client123",
            "full_name": "Bob Martin",
            "phone_number": "+15552222222",
            "address": "42 Victory Ave, Los Angeles, CA"
        },
        {
            "email": "carol@example.com",
            "password": "client123",
            "full_name": "Carol White",
            "phone_number": "+15553333333",
            "address": "8 Park Lane, Chicago, IL"
        },
        {
            "email": "daniel@example.com",
            "password": "client123",
            "full_name": "Daniel Craig",
            "phone_number": "+15554444444",
            "address": "25 Oak St, Houston, TX"
        }
    ]

    created_clients = []
    for client_data in clients_data:
        user = User(
            email=client_data["email"],
            password_hash=get_password_hash(client_data["password"]),
            role=UserRole.CLIENT,
        )
        db.add(user)
        await db.flush()

        client = Client(
            user_id=user.id,
            full_name=client_data["full_name"],
            phone_number=client_data["phone_number"],
            address=client_data["address"]
        )
        db.add(client)
        await db.flush()
        created_clients.append(client)
        print(f"  ✅ Client created: {client_data['full_name']} ({client_data['email']} / {client_data['password']})")

    await db.commit()

    pets_data = [
        {"name": "Rex", "species": PetSpecies.DOG, "breed": "German Shepherd", "birth_date": date(2019, 5, 15),
         "owner_idx": 0},
        {"name": "Luna", "species": PetSpecies.CAT, "breed": "British Shorthair", "birth_date": date(2020, 3, 20),
         "owner_idx": 0},
        {"name": "Bailey", "species": PetSpecies.DOG, "breed": "Labrador", "birth_date": date(2021, 7, 10),
         "owner_idx": 1},
        {"name": "Simba", "species": PetSpecies.CAT, "breed": "Persian", "birth_date": date(2018, 11, 5),
         "owner_idx": 1},
        {"name": "Charlie", "species": PetSpecies.DOG, "breed": "Beagle", "birth_date": date(2022, 1, 8),
         "owner_idx": 2},
        {"name": "Snowball", "species": PetSpecies.RABBIT, "breed": "Angora", "birth_date": date(2021, 6, 12),
         "owner_idx": 2},
        {"name": "Jack", "species": PetSpecies.DOG, "breed": "Yorkshire Terrier", "birth_date": date(2020, 9, 25),
         "owner_idx": 3},
        {"name": "Max", "species": PetSpecies.CAT, "breed": "Maine Coon", "birth_date": date(2019, 4, 18),
         "owner_idx": 3},
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
        print(f"  ✅ Pet created: {pet_data['name']} ({pet_data['breed']})")

    await db.commit()

    now = datetime.now(timezone.utc)
    appointments_data = [
        {"date_time": now + timedelta(days=1, hours=10), "doctor_idx": 0, "client_idx": 0, "pet_idx": 0,
         "reason": "Routine Checkup", "status": AppointmentStatus.PLANNED},
        {"date_time": now + timedelta(days=1, hours=14), "doctor_idx": 0, "client_idx": 1, "pet_idx": 2,
         "reason": "Vaccination", "status": AppointmentStatus.PLANNED},
        {"date_time": now + timedelta(days=2, hours=11), "doctor_idx": 1, "client_idx": 0, "pet_idx": 0,
         "reason": "Pre-surgery consultation", "status": AppointmentStatus.PLANNED},
        {"date_time": now + timedelta(days=3, hours=9), "doctor_idx": 2, "client_idx": 2, "pet_idx": 4,
         "reason": "Teeth cleaning", "status": AppointmentStatus.PLANNED},
        {"date_time": now + timedelta(days=3, hours=15), "doctor_idx": 3, "client_idx": 1, "pet_idx": 2,
         "reason": "Heart checkup", "status": AppointmentStatus.PLANNED},
        {"date_time": now + timedelta(days=4, hours=10), "doctor_idx": 4, "client_idx": 3, "pet_idx": 6,
         "reason": "Skin rash", "status": AppointmentStatus.PLANNED},
        {"date_time": now - timedelta(days=5, hours=14), "doctor_idx": 0, "client_idx": 0, "pet_idx": 1,
         "reason": "Routine Checkup", "status": AppointmentStatus.COMPLETED,
         "doctor_notes": "All good, pet is healthy."},
        {"date_time": now - timedelta(days=3, hours=10), "doctor_idx": 1, "client_idx": 2, "pet_idx": 5,
         "reason": "Sterilization", "status": AppointmentStatus.COMPLETED,
         "doctor_notes": "Surgery successful, normal recovery."},
        {"date_time": now - timedelta(days=2, hours=16), "doctor_idx": 2, "client_idx": 1, "pet_idx": 3,
         "reason": "Dental treatment", "status": AppointmentStatus.COMPLETED,
         "doctor_notes": "Caries removed, toothache gone."},
        {"date_time": now + timedelta(days=5, hours=12), "doctor_idx": 0, "client_idx": 3, "pet_idx": 7,
         "reason": "Routine Checkup", "status": AppointmentStatus.PLANNED},
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
    print(f"\n✅ Test data created successfully:")
    print(f"   - Doctors: {len(created_doctors)}")
    print(f"   - Clients: {len(created_clients)}")
    print(f"   - Pets: {len(created_pets)}")
    print(f"   - Appointments: {len(appointments_data)}")


async def setup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        await init_db(db)


if __name__ == "__main__":
    asyncio.run(setup())