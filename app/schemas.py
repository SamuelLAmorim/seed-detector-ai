from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
username: str
nome: str
cpf: str
local: str
tamanho_plantacao: float

class UserCreate(UserBase):
password: str

class UserResponse(UserBase):
id: int
class Config:
from_attributes = True

class Token(BaseModel):
access_token: str
token_type: str