from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.auth_repository import AuthRepository
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.schemas.schemas import UserCreate, LoginRequest, Token, TokenRefresh, UserPasswordReset, UserOut


class AuthService:
    def __init__(self, db: Session):
        self.repo = AuthRepository(db)

    def register(self, data: UserCreate) -> UserOut:
        if self.repo.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        user = self.repo.create(data)
        return UserOut.model_validate(user)

    def login(self, data: LoginRequest) -> Token:
        user = self.repo.authenticate(data.email, data.password)
        if not user:
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Conta inativa")
        return Token(
            access_token=create_access_token({"sub": str(user.id)}),
            refresh_token=create_refresh_token({"sub": str(user.id)}),
        )

    def refresh(self, data: TokenRefresh) -> Token:
        payload = decode_token(data.refresh_token)
        if payload is None or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Refresh token inválido")
        user_id = payload.get("sub")
        return Token(
            access_token=create_access_token({"sub": user_id}),
            refresh_token=create_refresh_token({"sub": user_id}),
        )

    def reset_password(self, data: UserPasswordReset) -> dict:
        user = self.repo.get_by_email(data.email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        self.repo.update_password(user, data.new_password)
        return {"message": "Senha atualizada com sucesso"}