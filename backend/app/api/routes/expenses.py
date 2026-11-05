from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.deps import get_current_user
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.schemas import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.models.models import User

router = APIRouter(prefix="/expenses", tags=["Expenses"])


def _assert_vehicle_ownership(vehicle_id: int, user: User, db: Session):
    if not VehicleRepository(db).get_by_id(vehicle_id, user.id):
        raise HTTPException(status_code=403, detail="Veículo não pertence ao usuário")


@router.get("/vehicle/{vehicle_id}", response_model=List[ExpenseOut])
def list_expenses(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _assert_vehicle_ownership(vehicle_id, current_user, db)
    return ExpenseRepository(db).get_all_by_vehicle(vehicle_id)


@router.post("/", response_model=ExpenseOut, status_code=201)
def create_expense(data: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _assert_vehicle_ownership(data.vehicle_id, current_user, db)
    return ExpenseRepository(db).create(data)


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = ExpenseRepository(db).get_by_id(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    _assert_vehicle_ownership(expense.vehicle_id, current_user, db)
    return expense


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: int, data: ExpenseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = ExpenseRepository(db).get_by_id(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    _assert_vehicle_ownership(expense.vehicle_id, current_user, db)
    return ExpenseRepository(db).update(expense, data)


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = ExpenseRepository(db).get_by_id(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    _assert_vehicle_ownership(expense.vehicle_id, current_user, db)
    ExpenseRepository(db).delete(expense)