import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.db import get_db, Base
from app.core.security import create_access_token
from app.doctors.models import Specialization

# Setup in-memory DB for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)
TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="function")
async def async_client():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create specialization
    async with TestingSessionLocal() as db:
        spec = Specialization(name_ru="Тест", name_en="Test", description_ru="Desc", description_en="Desc")
        db.add(spec)
        await db.commit()

    async with AsyncClient(
        transport=ASGITransport(app=app), 
        base_url="http://test"
    ) as client:
        yield client
    
    # Drop tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_full_flow(async_client):
    # 1. Register Client
    client_data = {
        "email": "client@example.com",
        "password": "password123",
        "full_name": "John Doe",
        "phone_number": "1234567890"
    }
    response = await async_client.post("/users/", json=client_data)
    assert response.status_code == 201
    client_token = await async_client.post("/users/login", data={"username": client_data["email"], "password": client_data["password"]})
    assert client_token.status_code == 200
    client_auth_header = {"Authorization": f"Bearer {client_token.json()['access_token']}"}

    # 2. Register Admin (Manually via DB or using initial_data logic if running on real db, but here we can just create one or use a backdoor)
    # Actually, let's create admin directly in DB fixture or via endpoint if we had one.
    # But since we use overrides, we can just inject an admin user into DB.
    # Alternatively, use the internal function to create admin.
    pass

    # Actually, simpler: Use `initial_data` setup logic or just insert manually
    from app.users.models import User, UserRole
    from app.core.security import get_password_hash
    async with TestingSessionLocal() as db:
        admin = User(
            email="admin@vet.com",
            password_hash=get_password_hash("admin123"),
            full_name="Admin",
            role=UserRole.ADMIN
        )
        db.add(admin)
        await db.commit()

    # Login as Admin
    admin_token_resp = await async_client.post("/users/login", data={"username": "admin@vet.com", "password": "admin123"})
    assert admin_token_resp.status_code == 200
    admin_auth_header = {"Authorization": f"Bearer {admin_token_resp.json()['access_token']}"}

    # 3. Admin creates Doctor
    doctor_data = {
        "email": "doctor@example.com",
        "password": "docpass",
        "full_name": "Dr. House",
        "specialization_id": 1,
        "price": 5000
    }
    resp = await async_client.post("/doctors/", json=doctor_data, headers=admin_auth_header)
    assert resp.status_code == 201
    doctor_id = resp.json()["doctor_id"]

    # Login as Doctor
    doc_token_resp = await async_client.post("/users/login", data={"username": "doctor@example.com", "password": "docpass"})
    assert doc_token_resp.status_code == 200
    doc_auth_header = {"Authorization": f"Bearer {doc_token_resp.json()['access_token']}"}

    # 4. Client creates Pet
    pet_data = {"name": "Buddy", "species": "Dog", "breed": "Golden Retriever"}
    resp = await async_client.post("/pets/", json=pet_data, headers=client_auth_header)
    assert resp.status_code == 201
    pet_id = resp.json()["id"]

    # 5. Client books Appointment
    import datetime
    future_time = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    appointment_data = {
        "doctor_id": doctor_id,
        "pet_id": pet_id,
        "date_time": future_time.isoformat(),
        "user_description": "Checkup"
    }
    resp = await async_client.post("/appointments/", json=appointment_data, headers=client_auth_header)
    assert resp.status_code == 201, resp.text
    app_id = resp.json()["id"]

    # 6. Doctor checks appointments
    resp = await async_client.get("/appointments/doctor", headers=doc_auth_header)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["id"] == app_id

    # 7. Doctor adds notes
    notes_data = {"doctor_notes": "All good"}
    resp = await async_client.patch(f"/appointments/{app_id}/notes", json=notes_data, headers=doc_auth_header)
    assert resp.status_code == 200
    assert resp.json()["doctor_notes"] == "All good"

    # 8. Client checks appointment details
    resp = await async_client.get("/appointments/", headers=client_auth_header)
    assert resp.status_code == 200
    assert resp.json()[0]["doctor_notes"] == "All good"
