from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.initial_data import init_db, setup
from app.db.session import Base, engine
from app.users.router import router as users_router
from app.doctors.router import router as doctors_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup()
    yield

app = FastAPI(title="VetClinic CRM", lifespan=lifespan)

app.include_router(users_router)
app.include_router(doctors_router)

@app.get("/")
def read_root():
    return {"message": "VetClinic CRM API is running!"}