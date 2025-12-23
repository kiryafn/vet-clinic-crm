from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.doctors.models import Specialization
from app.users import User, UserRole


def init_db(db: Session):
    if db.query(Specialization).first():
        return

    specs = [
        Specialization(
            name_ru="Терапевт", name_en="General Practitioner",
            description_ru="Общий осмотр и лечение", description_en="General checkup and treatment"
        ),
        Specialization(
            name_ru="Хирург", name_en="Surgeon",
            description_ru="Оперативное вмешательство", description_en="Surgical operations"
        ),
        Specialization(
            name_ru="Офтальмолог", name_en="Ophthalmologist",
            description_ru="Лечение глаз", description_en="Eye treatment"
        ),
        Specialization(
            name_ru="Дерматолог", name_en="Dermatologist",
            description_ru="Лечение кожи", description_en="Skin treatment"
        ),
        Specialization(
            name_ru="Ратолог", name_en="Exotic Animal Vet",
            description_ru="Специалист по грызунам", description_en="Specialist in rodents and exotic animals"
        ),
    ]

    admin_email = "admin@vet.com"
    if not db.query(User).filter(User.email == admin_email).first():
        admin = User(
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            full_name="Super Admin",
            role=UserRole.ADMIN,
            phone_number="+0000000000"
        )
        db.add(admin)
        db.commit()
        print(f"✅ Супер-Админ создан: {admin_email} / admin123")
    else:
        print("⚠️ Админ уже существует.")

    db.add_all(specs)
    db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    init_db(db)
    db.close()