from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class UserBase(SQLModel):
    username: str
    email: str
    full_name: Optional[str] = None


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    detections: list["Detection"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


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


class DetectionRead(SQLModel):
    id: int
    inteiras: int
    predadas: int
    quebradas: int
    total: int
    modelo_utilizado: str
    confianca_limiar: float
    created_at: datetime


class AnalysisUploadResponse(SQLModel):
    inteiras: int
    quebradas: int
    predadas: int
    total: int
    id_deteccao: int
    annotated_image: str


class DeleteResponse(SQLModel):
    message: str


class ProfileResponse(SQLModel):
    username: str
    email: str
    full_name: Optional[str] = None
    total_analises: int
    total_sementes: int
    total_inteiras: int
    total_quebradas: int
    total_predadas: int
    aproveitamento_geral: float
    ultima_analise: Optional[str] = None
