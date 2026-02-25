import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

load_dotenv() # Carrega as variáveis do arquivo .env

# A URL virá do Docker depois, mas já deixamos preparada
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/seed_db")

engine = create_engine(DATABASE_URL)

def init_db():
    """Cria as tabelas no banco de dados se não existirem"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Função para ser usada como Dependência no FastAPI"""
    with Session(engine) as session:
        yield session