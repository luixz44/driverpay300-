from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey,
    Enum, Text, Boolean, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.session import Base


class FuelType(str, enum.Enum):
    gasolina = "gasolina"
    etanol = "etanol"
    flex = "flex"
    diesel = "diesel"
    eletrico = "eletrico"


class AppType(str, enum.Enum):
    uber = "Uber"
    noventa_e_nove = "99"
    indrive = "InDrive"
    chofer = "Chofer"
    outros = "Outros"


class ExpenseType(str, enum.Enum):
    combustivel = "combustivel"
    manutencao = "manutencao"
    lavagem = "lavagem"
    seguro = "seguro"
    ipva = "ipva"
    multa = "multa"
    outros = "outros"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    vehicles = relationship("Vehicle", back_populates="user", cascade="all, delete-orphan")


class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    plate = Column(String(20), unique=True, nullable=False)
    fuel_type = Column(Enum(FuelType), nullable=False)
    current_km = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user = relationship("User", back_populates="vehicles")
    rides = relationship("Ride", back_populates="vehicle", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="vehicle", cascade="all, delete-orphan")
    obd2_records = relationship("OBD2Record", back_populates="vehicle", cascade="all, delete-orphan")
    __table_args__ = (Index("ix_vehicles_user_id", "user_id"),)


class Ride(Base):
    __tablename__ = "rides"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    value = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    app_used = Column(Enum(AppType), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    vehicle = relationship("Vehicle", back_populates="rides")
    __table_args__ = (Index("ix_rides_vehicle_id", "vehicle_id"),)


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    type = Column(Enum(ExpenseType), nullable=False)
    value = Column(Float, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    vehicle = relationship("Vehicle", back_populates="expenses")
    __table_args__ = (Index("ix_expenses_vehicle_id", "vehicle_id"),)


class OBD2Record(Base):
    __tablename__ = "obd2_records"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    rpm = Column(Float)
    speed_kmh = Column(Float)
    engine_temp_c = Column(Float)
    instant_consumption = Column(Float)
    odometer_km = Column(Float)
    engine_runtime_s = Column(Float)
    vehicle = relationship("Vehicle", back_populates="obd2_records")
    __table_args__ = (Index("ix_obd2_vehicle_id", "vehicle_id"),)