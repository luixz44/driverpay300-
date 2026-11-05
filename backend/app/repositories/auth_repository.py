from sqlalchemy.orm import Session
from app.models.models import User
from app.core.security import verify_password, get_password_hash
from app.schemas.schemas import UserCreate
from typing import Optional


class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, data: UserCreate) -> User:
        user = User(
            name=data.name,
            email=data.email,
            hashed_password=get_password_hash(data.password),
            phone=data.phone,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate(self, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    def update_password(self, user: User, new_password: str) -> User:
        user.hashed_password = get_password_hash(new_password)
        self.db.commit()
        self.db.refresh(user)
        return user