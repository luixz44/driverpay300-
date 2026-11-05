from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.deps import get_current_user
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.schemas import VehicleCreate, VehicleUpdate, VehicleOut
from app.models.models import User

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


def _get_vehicle_or_404(vehicle_id: int, user: User, db: Session):
    v = VehicleRepository(db).get_by_id(vehicle_id, user.id)
    if not v:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return v


@router.get("/", response_model=List[VehicleOut])
def list_vehicles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return VehicleRepository(db).get_all_by_user(current_user.id)


@router.post("/", response_model=VehicleOut, status_code=201)
def create_vehicle(data: VehicleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return VehicleRepository(db).create(data, current_user.id)


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_vehicle_or_404(vehicle_id, current_user, db)


@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: int, data: VehicleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicle = _get_vehicle_or_404(vehicle_id, current_user, db)
    return VehicleRepository(db).update(vehicle, data)


@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vehicle = _get_vehicle_or_404(vehicle_id, current_user, db)
    VehicleRepository(db).delete(vehicle)