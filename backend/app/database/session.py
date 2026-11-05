from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




try:
    Base.metadata.create_all(bind=engine)
    print("Tabelas do banco de dados sincronizadas com sucesso!")
except Exception as e:
    print(f"Erro ao sincronizar tabelas: {e}")
