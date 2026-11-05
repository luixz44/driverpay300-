from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.deps import get_current_user
from app.repositories.obd2_repository import OBD2Repository
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.schemas import OBD2RecordCreate, OBD2RecordOut
from app.models.models import User

router = APIRouter(prefix="/obd2", tags=["OBD2"])


def _assert_vehicle_ownership(vehicle_id: int, user: User, db: Session):
    if not VehicleRepository(db).get_by_id(vehicle_id, user.id):
        raise HTTPException(status_code=403, detail="Veículo não pertence ao usuário")


@router.post("/record", response_model=OBD2RecordOut, status_code=201)
def record_obd2(data: OBD2RecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _assert_vehicle_ownership(data.vehicle_id, current_user, db)
    return OBD2Repository(db).create(data)


@router.get("/history/{vehicle_id}", response_model=List[OBD2RecordOut])
def get_history(vehicle_id: int, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _assert_vehicle_ownership(vehicle_id, current_user, db)
    return OBD2Repository(db).get_history(vehicle_id, limit)


@router.get("/status")
def obd2_status():
    return {
        "status": "ready",
        "message": "Backend pronto para receber dados OBD2.",
        "supported_pids": ["RPM", "SPEED", "COOLANT_TEMP", "FUEL_CONSUMPTION", "ODOMETER", "ENGINE_RUNTIME"],
    }