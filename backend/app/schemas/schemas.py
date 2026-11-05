from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.models import FuelType, AppType, ExpenseType


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Senha deve ter pelo menos 6 caracteres")
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class UserPasswordReset(BaseModel):
    email: EmailStr
    new_password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class VehicleCreate(BaseModel):
    brand: str
    model: str
    year: int
    plate: str
    fuel_type: FuelType
    current_km: float = 0


class VehicleUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    plate: Optional[str] = None
    fuel_type: Optional[FuelType] = None
    current_km: Optional[float] = None


class VehicleOut(BaseModel):
    id: int
    user_id: int
    brand: str
    model: str
    year: int
    plate: str
    fuel_type: FuelType
    current_km: float
    created_at: datetime
    model_config = {"from_attributes": True}


class RideCreate(BaseModel):
    vehicle_id: int
    value: float
    distance_km: float
    app_used: AppType
    notes: Optional[str] = None

    @field_validator("value")
    @classmethod
    def value_not_negative(cls, v):
        if v < 0:
            raise ValueError("Valor não pode ser negativo")
        return v

    @field_validator("distance_km")
    @classmethod
    def distance_positive(cls, v):
        if v <= 0:
            raise ValueError("Distância deve ser maior que zero")
        return v


class RideUpdate(BaseModel):
    date: Optional[datetime] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    value: Optional[float] = None
    distance_km: Optional[float] = None
    app_used: Optional[AppType] = None
    notes: Optional[str] = None


class RideOut(BaseModel):
    id: int
    vehicle_id: int
    value: float
    distance_km: float
    app_used: AppType
    notes: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


class ExpenseCreate(BaseModel):
    vehicle_id: int
    date: datetime
    type: ExpenseType
    value: float
    notes: Optional[str] = None


class ExpenseUpdate(BaseModel):
    date: Optional[datetime] = None
    type: Optional[ExpenseType] = None
    value: Optional[float] = None
    notes: Optional[str] = None


class ExpenseOut(BaseModel):
    id: int
    vehicle_id: int
    date: datetime
    type: ExpenseType
    value: float
    notes: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


class OBD2RecordCreate(BaseModel):
    vehicle_id: int
    rpm: Optional[float] = None
    speed_kmh: Optional[float] = None
    engine_temp_c: Optional[float] = None
    instant_consumption: Optional[float] = None
    odometer_km: Optional[float] = None
    engine_runtime_s: Optional[float] = None


class OBD2RecordOut(BaseModel):
    id: int
    vehicle_id: int
    timestamp: datetime
    rpm: Optional[float]
    speed_kmh: Optional[float]
    engine_temp_c: Optional[float]
    instant_consumption: Optional[float]
    odometer_km: Optional[float]
    engine_runtime_s: Optional[float]
    model_config = {"from_attributes": True}


class MonthlyData(BaseModel):
    month: str
    total: float


class DashboardOut(BaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    avg_consumption: Optional[float]
    total_km: float
    monthly_revenue: List[MonthlyData]
    monthly_expenses: List[MonthlyData]
    monthly_profit: List[MonthlyData]
    monthly_km: List[MonthlyData]