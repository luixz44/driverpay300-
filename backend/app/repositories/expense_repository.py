from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from app.models.models import Expense
from app.schemas.schemas import ExpenseCreate, ExpenseUpdate
from typing import List, Optional


class ExpenseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_vehicle(self, vehicle_id: int) -> List[Expense]:
        return self.db.query(Expense).filter(Expense.vehicle_id == vehicle_id).order_by(Expense.date.desc()).all()

    def get_by_id(self, expense_id: int) -> Optional[Expense]:
        return self.db.query(Expense).filter(Expense.id == expense_id).first()

    def create(self, data: ExpenseCreate) -> Expense:
        expense = Expense(**data.model_dump())
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def update(self, expense: Expense, data: ExpenseUpdate) -> Expense:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(expense, field, value)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def delete(self, expense: Expense) -> None:
        self.db.delete(expense)
        self.db.commit()

    def get_monthly_expenses(self, vehicle_ids: List[int], year: int) -> List[dict]:
        results = (
            self.db.query(
                extract("month", Expense.date).label("month"),
                func.sum(Expense.value).label("total"),
            )
            .filter(Expense.vehicle_id.in_(vehicle_ids), extract("year", Expense.date) == year)
            .group_by(extract("month", Expense.date))
            .all()
        )
        return [{"month": int(r.month), "total": float(r.total)} for r in results]

    def get_total(self, vehicle_ids: List[int]) -> float:
        result = self.db.query(func.sum(Expense.value)).filter(
            Expense.vehicle_id.in_(vehicle_ids)
        ).scalar()
        return float(result or 0)