from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import OBD2Record
from app.schemas.schemas import OBD2RecordCreate
from typing import List, Optional


class OBD2Repository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: OBD2RecordCreate) -> OBD2Record:
        record = OBD2Record(**data.model_dump())
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_history(self, vehicle_id: int, limit: int = 100) -> List[OBD2Record]:
        return (
            self.db.query(OBD2Record)
            .filter(OBD2Record.vehicle_id == vehicle_id)
            .order_by(OBD2Record.timestamp.desc())
            .limit(limit)
            .all()
        )

    def get_avg_consumption(self, vehicle_ids: List[int]) -> Optional[float]:
        result = self.db.query(func.avg(OBD2Record.instant_consumption)).filter(
            OBD2Record.vehicle_id.in_(vehicle_ids),
            OBD2Record.instant_consumption.isnot(None),
        ).scalar()
        return float(result) if result else None