from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.session import Base, engine
from app.users.router import router as users_router
from app.users import models as user_models
from app.doctors import models as doctor_models

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="VetClinic CRM", lifespan=lifespan)

app.include_router(users_router)

@app.get("/")
def read_root():
    return {"message": "VetClinic CRM API is running!"}