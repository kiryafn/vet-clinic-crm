# backend/app/users/router.py
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core import security
from app.core.config import settings
from app.core.db import SessionDep
from app.users import schemas, service, User
from app.users.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

# --- УДАЛЕН МЕТОД REGISTER ---
# Он переехал в clients/router.py

@router.post("/login", response_model=schemas.Token)
async def login(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        db: SessionDep
):
    user = await service.get_user_by_email(db, email=form_data.username)

    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user