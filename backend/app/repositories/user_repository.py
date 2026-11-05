from sqlalchemy.orm import Session
from app.models.models import User
from app.schemas.schemas import UserUpdate
from typing import Optional


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def update(self, user: User, data: UserUpdate) -> User:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(user, field, value)
        self.db.commit()
        self.db.refresh(user)
        return user