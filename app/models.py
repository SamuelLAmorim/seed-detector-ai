from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime

# Modelo para o Banco de Dados
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str
    full_name: Optional[str] = None
    hashed_password: str
    detections: List["Detection"] = Relationship(back_populates="user")

# Modelo para o Cadastro (O que faltava!)
class UserCreate(SQLModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None

# Modelo para o Login/Token
class Token(SQLModel):
    access_token: str
    token_type: str

# Modelo para as Detecções da IA
class Detection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    inteiras: int
    predadas: int
    quebradas: int
    total: int
    modelo_utilizado: str
    confianca_limiar: float
    image_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="detections")