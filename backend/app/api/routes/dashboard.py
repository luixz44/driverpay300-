from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from app.database.session import get_db
from app.core.deps import get_current_user
from app.services.dashboard_service import DashboardService
from app.services.report_service import ReportService
from app.schemas.schemas import DashboardOut
from app.models.models import User

dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
reports_router = APIRouter(prefix="/reports", tags=["Reports"])


@dashboard_router.get("/", response_model=DashboardOut)
def get_dashboard(year: int = Query(default=None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return DashboardService(db).get_dashboard(current_user, year)


@reports_router.get("/rides/excel")
def export_rides_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = ReportService(db).export_rides_excel(current_user)
    return StreamingResponse(BytesIO(data),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=corridas.xlsx"})


@reports_router.get("/expenses/excel")
def export_expenses_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = ReportService(db).export_expenses_excel(current_user)
    return StreamingResponse(BytesIO(data),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=despesas.xlsx"})


@reports_router.get("/rides/pdf")
def export_rides_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = ReportService(db).export_rides_pdf(current_user)
    return StreamingResponse(BytesIO(data), media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=corridas.pdf"})