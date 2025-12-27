from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings
from app.core.db import SessionDep, get_db
from app.users import service, models, User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        db: SessionDep
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await service.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception

    return user

async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


from sqlalchemy import select
from app.doctors.models import Doctor

async def get_current_doctor(
    db: SessionDep,
    current_user: User = Depends(get_current_user)
) -> Doctor:
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a doctor"
        )
    
    # Need to fetch Doctor model
    result = await db.execute(select(Doctor).filter(Doctor.user_id == current_user.id))
    doctor = result.scalars().first()
    
    if not doctor:
         raise HTTPException(
            status_code=404,  # Should not happen if data is consistent
            detail="Doctor profile not found"
        )
    return doctor

CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentDoctor = Annotated[Doctor, Depends(get_current_doctor)]