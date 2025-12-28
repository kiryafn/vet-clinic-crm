from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#routers
from app.core.initial_data import setup
from app.users.router import router as users_router
from app.doctors.router import router as doctors_router
from app.pets.router import router as pet_router
from app.appointments.router import router as appointment_router
#models
from app.users import models as user_models
from app.doctors import models as doctor_models
from app.pets import models as pet_models
from app.appointments import models as appointment_models

@asynccontextmanager
async def lifespan(app: FastAPI):
    await setup()
    yield

app = FastAPI(title="VetClinic CRM", lifespan=lifespan)

# --- 2. ДОБАВЛЯЕМ ЭТОТ БЛОК СРАЗУ ПОСЛЕ СОЗДАНИЯ APP ---
# Разрешаем запросы с фронтенда (localhost:5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,    # Разрешаем эти источники
    allow_credentials=True,   # Разрешаем куки/токены
    allow_methods=["*"],      # Разрешаем все методы (GET, POST, OPTIONS и т.д.)
    allow_headers=["*"],      # Разрешаем все заголовки
)

app.include_router(users_router)
app.include_router(doctors_router)
app.include_router(pet_router)
app.include_router(appointment_router)

@app.get("/")
def read_root():
    return {"message": "VetClinic CRM API is running!"}