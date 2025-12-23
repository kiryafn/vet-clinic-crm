from sqlalchemy.orm import Session
from app.users import User
from app.users import UserCreate
from app.core.security import get_password_hash


def create_user(db: Session, user_in: UserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)

    db_user = User(
        **user_in.model_dump(exclude={"password"}),
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()