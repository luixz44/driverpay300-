from sqlalchemy.orm import Session
from datetime import datetime
from app.repositories.ride_repository import RideRepository
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.obd2_repository import OBD2Repository
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.schemas import DashboardOut, MonthlyData
from app.models.models import User

MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]


class DashboardService:
    def __init__(self, db: Session):
        self.ride_repo = RideRepository(db)
        self.expense_repo = ExpenseRepository(db)
        self.obd2_repo = OBD2Repository(db)
        self.vehicle_repo = VehicleRepository(db)

    def get_dashboard(self, user: User, year: int = None) -> DashboardOut:
        year = year or datetime.now().year
        vehicles = self.vehicle_repo.get_all_by_user(user.id)
        vehicle_ids = [v.id for v in vehicles]

        if not vehicle_ids:
            return DashboardOut(
                total_revenue=0, total_expenses=0, net_profit=0,
                avg_consumption=None, total_km=0,
                monthly_revenue=[], monthly_expenses=[],
                monthly_profit=[], monthly_km=[],
            )

        totals = self.ride_repo.get_totals(vehicle_ids)
        total_expenses = self.expense_repo.get_total(vehicle_ids)
        avg_consumption = self.obd2_repo.get_avg_consumption(vehicle_ids)
        monthly_rides = {r["month"]: r for r in self.ride_repo.get_monthly_revenue(vehicle_ids, year)}
        monthly_exp = {e["month"]: e["total"] for e in self.expense_repo.get_monthly_expenses(vehicle_ids, year)}

        monthly_revenue, monthly_expenses, monthly_profit, monthly_km = [], [], [], []
        for m in range(1, 13):
            label = MONTHS[m - 1]
            rev = monthly_rides.get(m, {}).get("total", 0)
            exp = monthly_exp.get(m, 0)
            km = monthly_rides.get(m, {}).get("total_km", 0)
            monthly_revenue.append(MonthlyData(month=label, total=rev))
            monthly_expenses.append(MonthlyData(month=label, total=exp))
            monthly_profit.append(MonthlyData(month=label, total=rev - exp))
            monthly_km.append(MonthlyData(month=label, total=km))

        return DashboardOut(
            total_revenue=totals["total_revenue"],
            total_expenses=total_expenses,
            net_profit=totals["total_revenue"] - total_expenses,
            avg_consumption=avg_consumption,
            total_km=totals["total_km"],
            monthly_revenue=monthly_revenue,
            monthly_expenses=monthly_expenses,
            monthly_profit=monthly_profit,
            monthly_km=monthly_km,
        )