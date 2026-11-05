from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.auth_service import AuthService
from app.schemas.schemas import Token, TokenRefresh, LoginRequest, UserCreate




router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return AuthService(db).login(data)

@router.post("/swagger-login", response_model=Token, include_in_schema=False)
def swagger_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    login_data = LoginRequest(email=form_data.username, password=form_data.password)
    return AuthService(db).login(login_data)

@router.post("/refresh", response_model=Token)
def refresh(data: TokenRefresh, db: Session = Depends(get_db)):
    return AuthService(db).refresh(data)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return AuthService(db).register(data)

from pydantic import BaseModel


class GenericRecover(BaseModel):
    email: str

@router.post("/recover")
def recover(data: GenericRecover, db: Session = Depends(get_db)):
    return AuthService(db).forgot_password(data)

