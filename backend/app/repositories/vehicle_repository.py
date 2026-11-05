from sqlalchemy.orm import Session
from app.models.models import Vehicle
from app.schemas.schemas import VehicleCreate, VehicleUpdate
from typing import List, Optional


class VehicleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_user(self, user_id: int) -> List[Vehicle]:
        return self.db.query(Vehicle).filter(Vehicle.user_id == user_id).all()

    def get_by_id(self, vehicle_id: int, user_id: int) -> Optional[Vehicle]:
        return self.db.query(Vehicle).filter(
            Vehicle.id == vehicle_id, Vehicle.user_id == user_id
        ).first()

    def create(self, data: VehicleCreate, user_id: int) -> Vehicle:
        vehicle = Vehicle(**data.model_dump(), user_id=user_id)
        self.db.add(vehicle)
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def update(self, vehicle: Vehicle, data: VehicleUpdate) -> Vehicle:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(vehicle, field, value)
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def delete(self, vehicle: Vehicle) -> None:
        self.db.delete(vehicle)
        self.db.commit()