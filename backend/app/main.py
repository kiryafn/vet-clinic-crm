from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.session import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="VetClinic CRM",
    lifespan=lifespan
)

@app.get("/")
def read_root():
    return {"message": "VetClinic CRM API is running!"}