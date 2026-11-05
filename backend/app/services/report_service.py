from sqlalchemy.orm import Session
from io import BytesIO
from datetime import datetime
from app.repositories.ride_repository import RideRepository
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.models.models import User


class ReportService:
    def __init__(self, db: Session):
        self.ride_repo = RideRepository(db)
        self.expense_repo = ExpenseRepository(db)
        self.vehicle_repo = VehicleRepository(db)

    def _get_vehicle_ids(self, user: User):
        return [v.id for v in self.vehicle_repo.get_all_by_user(user.id)]

    def export_rides_excel(self, user: User) -> bytes:
        import openpyxl
        vehicle_ids = self._get_vehicle_ids(user)
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Corridas"
        # Removeu "Origem" e "Destino" do cabeçalho:
        ws.append(["ID", "Veiculo ID", "Data", "Valor (R$)", "Distância (km)", "Aplicativo"])
        for vid in vehicle_ids:
            for ride in self.ride_repo.get_all_by_vehicle(vid):
                # Removeu ride.origin e ride.destination da linha:
                ws.append([ride.id, ride.vehicle_id, ride.created_at.strftime("%d/%m/%Y %H:%M"),
                           ride.value, ride.distance_km, ride.app_used.value])

        buf = BytesIO()
        wb.save(buf)
        return buf.getvalue()

    def export_expenses_excel(self, user: User) -> bytes:
        import openpyxl
        vehicle_ids = self._get_vehicle_ids(user)
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Despesas"
        ws.append(["ID", "Veículo ID", "Data", "Tipo", "Valor (R$)", "Observação"])
        for vid in vehicle_ids:
            for exp in self.expense_repo.get_all_by_vehicle(vid):
             ws.append([exp.id, exp.vehicle_id, exp.created_at.strftime("%d/%m/%Y"),

                           exp.type.value, exp.value, exp.notes or ""])
        buf = BytesIO()
        wb.save(buf)
        return buf.getvalue()

    def export_rides_pdf(self, user: User) -> bytes:
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors

        vehicle_ids = self._get_vehicle_ids(user)
        buf = BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=landscape(A4))
        styles = getSampleStyleSheet()
        elements = [
            Paragraph(f"Relatório de Corridas - {user.name}", styles["Title"]),
            Paragraph(f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles["Normal"]),
            Spacer(1, 20),
        ]
        
        data = [["ID", "Data", "Valor (R$)", "Dist. (km)", "Aplicativo"]]
        for vid in vehicle_ids:
            for ride in self.ride_repo.get_all_by_vehicle(vid):
                data.append([
                    str(ride.id),
                    ride.created_at.strftime("%d/%m/%Y"),
                    f"R$ {ride.value:.2f}",
                    f"{ride.distance_km:.1f}",
                    ride.app_used.value
                ])

        table = Table(data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a73e8")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
        ]))
        elements.append(table)
        doc.build(elements)
        return buf.getvalue()
