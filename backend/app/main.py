from fastapi import FastAPI
from app.core.config import settings
from app.users.router import router as users_router

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])

@app.get("/")
def root():
    return {"message": "Welcome to VetClinic CRM API"}