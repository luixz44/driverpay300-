from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from app.models.models import Ride
from app.schemas.schemas import RideCreate, RideUpdate
from typing import List, Optional


class RideRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_vehicle(self, vehicle_id: int) -> List[Ride]:
        return self.db.query(Ride).filter(Ride.vehicle_id == vehicle_id).order_by(Ride.id.desc()).all()


    def get_by_id(self, ride_id: int) -> Optional[Ride]:
        return self.db.query(Ride).filter(Ride.id == ride_id).first()

    def create(self, data: RideCreate) -> Ride:
        ride = Ride(**data.model_dump())
        self.db.add(ride)
        self.db.commit()
        self.db.refresh(ride)
        return ride

    def update(self, ride: Ride, data: RideUpdate) -> Ride:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(ride, field, value)
        self.db.commit()
        self.db.refresh(ride)
        return ride

    def delete(self, ride: Ride) -> None:
        self.db.delete(ride)
        self.db.commit()

    def get_monthly_revenue(self, vehicle_ids: List[int], year: int) -> List[dict]:
        results = (
            self.db.query(
                extract("month", Ride.created_at).label("month"),
                func.sum(Ride.value).label("total"),
                func.sum(Ride.distance_km).label("total_km"),
            )
            .filter(Ride.vehicle_id.in_(vehicle_ids), extract("year", Ride.created_at) == year)
            .group_by(extract("month", Ride.created_at))
            .all()
        )
        return [{"month": int(r.month), "total": float(r.total), "total_km": float(r.total_km)} for r in results]

    def get_totals(self, vehicle_ids: List[int]) -> dict:
        result = self.db.query(
            func.sum(Ride.value).label("total_revenue"),
            func.sum(Ride.distance_km).label("total_km"),
        ).filter(Ride.vehicle_id.in_(vehicle_ids)).first()
        return {
            "total_revenue": float(result.total_revenue or 0),
            "total_km": float(result.total_km or 0),
        }