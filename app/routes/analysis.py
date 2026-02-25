from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlmodel import Session, select
import shutil
import os
from datetime import datetime
from jose import jwt

from app.database import get_session
from app.models import Detection, User
from app.detector import SeedDetector
from app.auth import oauth2_scheme, SECRET_KEY, ALGORITHM

# Adicionamos o prefixo e as tags para organização automática no Swagger
router = APIRouter(prefix="/analysis", tags=["Análise"])
detector = SeedDetector()

def get_current_user(db: Session, token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        # O db.exec(select(...)) do SQLModel às vezes confunde o FastAPI se não tipado
        user = db.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

# response_model=None para evitar que o FastAPI 
# tente validar objetos complexos de banco de dados no retorno.
@router.post("/upload", response_model=None)
async def upload_image(
    file: UploadFile = File(...),
    conf: float = 0.25, 
    db: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
):
    # 1. Autenticação
    user = get_current_user(db, token)
    
    # 2. Persistência física da imagem
    if not os.path.exists("storage"):
        os.makedirs("storage")
        
    file_path = f"storage/{datetime.now().timestamp()}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3. Leitura e Predição
    with open(file_path, "rb") as f:
        image_bytes = f.read()
    
    # Passamos o 'conf' que vem do slider do Frontend
    counts, annotated_img = detector.predict(image_bytes, conf=conf)

    # 4. Salvar no Banco de Dados
    new_detection = Detection(
        inteiras=counts.get("inteira", 0),
        predadas=counts.get("predada", 0),
        quebradas=counts.get("quebrada", 0),
        total=sum(counts.values()),
        modelo_utilizado="YOLOv11_Seed",
        confianca_limiar=conf,
        image_path=file_path,
        user_id=user.id
    )
    
    db.add(new_detection)
    db.commit()
    db.refresh(new_detection)


    return {
        "inteiras": new_detection.inteiras,
        "quebradas": new_detection.quebradas,
        "predadas": new_detection.predadas,
        "total": new_detection.total,
        "id_deteccao": new_detection.id
    }

@router.get("/history", response_model=None)
async def get_history(
    db: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
):
    user = get_current_user(db, token)
    # Busca todas as detecções do usuário logado
    statement = select(Detection).where(Detection.user_id == user.id)
    history = db.exec(statement).all()
    
    return history