from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

db_url = settings.DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")

engine = create_async_engine(
    db_url,
    connect_args={"check_same_thread": False}
)

class Base(DeclarativeBase):
    pass

async_session_factory = async_sessionmaker(expire_on_commit=False, bind=engine)

async def get_db():
    async with async_session_factory() as db:
        yield db

SessionDep = Annotated[AsyncSession, Depends(get_db)]