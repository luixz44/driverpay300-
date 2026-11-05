from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import engine

from app.api.routes import auth, users, vehicles, rides, expenses, obd2, dashboard



app = FastAPI(
    title="DriverApp API",
    description="Sistema de Gestão Financeira para Motoristas de Aplicativo",
    version="1.0.0",
    swagger_ui_parameters={"persistAuthorization": True}
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(vehicles.router, prefix=API_PREFIX)
app.include_router(rides.router, prefix=API_PREFIX)
app.include_router(expenses.router, prefix=API_PREFIX)
app.include_router(obd2.router, prefix=API_PREFIX)
app.include_router(dashboard.dashboard_router, prefix=API_PREFIX)
app.include_router(dashboard.reports_router, prefix=API_PREFIX)


@app.get("/")
def root():
    return {"message": "DriverApp API rodando!", "docs": "/docs"}