from contextlib import asynccontextmanager
from fastapi import FastAPI
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

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VetClinic CRM", lifespan=lifespan)

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
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
app.include_router(pet_router)
app.include_router(appointment_router)

@app.get("/")
def read_root():
    return {"message": "VetClinic CRM API is running!"}