from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.users import service, schemas

router = APIRouter()


@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
        user_in: schemas.UserCreate,
        db: Session = Depends(get_db)
):
    user_exists = service.get_user_by_email(db, email=user_in.email)
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    return service.create_user(db=db, user_in=user_in)