from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.deps import get_current_user
from app.repositories.ride_repository import RideRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.schemas import RideCreate, RideUpdate, RideOut
from app.models.models import User

router = APIRouter(prefix="/rides", tags=["Rides"])


def _assert_vehicle_ownership(vehicle_id: int, user: User, db: Session):
    if not VehicleRepository(db).get_by_id(vehicle_id, user.id):
        raise HTTPException(status_code=403, detail="Veículo não pertence ao usuário")


@router.get("/vehicle/{vehicle_id}", response_model=List[RideOut])
def list_rides(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _assert_vehicle_ownership(vehicle_id, current_user, db)
    return RideRepository(db).get_all_by_vehicle(vehicle_id)


@router.post("/", response_model=RideOut, status_code=201)
def create_ride(data: RideCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _assert_vehicle_ownership(data.vehicle_id, current_user, db)
    return RideRepository(db).create(data)


@router.get("/{ride_id}", response_model=RideOut)
def get_ride(ride_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ride = RideRepository(db).get_by_id(ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")
    _assert_vehicle_ownership(ride.vehicle_id, current_user, db)
    return ride


@router.put("/{ride_id}", response_model=RideOut)
def update_ride(ride_id: int, data: RideUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ride = RideRepository(db).get_by_id(ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")
    _assert_vehicle_ownership(ride.vehicle_id, current_user, db)
    return RideRepository(db).update(ride, data)


@router.delete("/{ride_id}", status_code=204)
def delete_ride(ride_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ride = RideRepository(db).get_by_id(ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")
    _assert_vehicle_ownership(ride.vehicle_id, current_user, db)
    RideRepository(db).delete(ride)