from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#routers
from app.core.initial_data import setup
from app.users.router import router as users_router
from app.doctors.router import router as doctors_router
from app.pets.router import router as pet_router
from app.appointments.router import router as appointment_router
from app.clients.router import router as clients_router
#models
from app.users import models as user_models
from app.doctors import models as doctor_models
from app.pets import models as pet_models
from app.appointments import models as appointment_models
from app.clients import models as client_models

@asynccontextmanager
async def lifespan(app: FastAPI):
    await setup()
    yield

app = FastAPI(title="VetClinic CRM", lifespan=lifespan)


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.0.31:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(doctors_router)
app.include_router(clients_router)
app.include_router(pet_router)
app.include_router(appointment_router)