from sqlalchemy.orm import Session
from app.users.models import User
from app.users.schemas import UserCreate
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate) -> User:
    password_hash = get_password_hash(user.password)

    db_user = User(
        email=user.email,
        password_hash=password_hash,
        full_name=user.full_name,
        role=user.role,
        phone_number=user.phone_number,
        address=user.address
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user