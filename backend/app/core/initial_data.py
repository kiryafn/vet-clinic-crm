import asyncio
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.doctors.models import Specialization

def init_db(db: Session):
    if db.query(Specialization).first():
        return

    specs = [
        Specialization(name="Терапевт", description="Общий осмотр и лечение"),
        Specialization(name="Хирург", description="Оперативное вмешательство"),
        Specialization(name="Офтальмолог", description="Лечение глаз"),
        Specialization(name="Дерматолог", description="Лечение кожи"),
        Specialization(name="Ратолог", description="Специалист по грызунам"),
    ]

    db.add_all(specs)
    db.commit()
    print("✅ Специализации добавлены!")

if __name__ == "__main__":
    db = SessionLocal()
    init_db(db)
    db.close()