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

router = APIRouter(prefix="/analysis", tags=["Análise"])
detector = SeedDetector()

def get_current_user(db: Session, token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user = db.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


@router.post("/upload", response_model=None)
async def upload_image(
    file: UploadFile = File(...),
    conf: float = 0.25,
    db: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
):
    user = get_current_user(db, token)

    if not os.path.exists("storage"):
        os.makedirs("storage")

    file_path = f"storage/{datetime.now().timestamp()}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with open(file_path, "rb") as f:
        image_bytes = f.read()

    counts, annotated_b64 = detector.predict(image_bytes, conf=conf)

    new_detection = Detection(
        inteiras=counts.get("inteira", 0),
        predadas=counts.get("pedrada", 0),
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
        "id_deteccao": new_detection.id,
        "annotated_image": annotated_b64,  # ← imagem anotada em base64
    }


@router.get("/history", response_model=None)
async def get_history(
    db: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
):
    user = get_current_user(db, token)
    statement = select(Detection).where(Detection.user_id == user.id).order_by(Detection.id.desc())
    history = db.exec(statement).all()
    return history


@router.delete("/{detection_id}", response_model=None)
async def delete_detection(
    detection_id: int,
    db: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
):
    user = get_current_user(db, token)
    detection = db.get(Detection, detection_id)

    if not detection:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    if detection.user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para deletar esta análise")

    # Remove imagem do disco se existir
    if detection.image_path and os.path.exists(detection.image_path):
        os.remove(detection.image_path)

    db.delete(detection)
    db.commit()
    return {"message": "Análise deletada com sucesso"}


@router.get("/profile", response_model=None)
async def get_profile(
    db: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
):
    user = get_current_user(db, token)
    statement = select(Detection).where(Detection.user_id == user.id)
    detections = db.exec(statement).all()

    total_analises = len(detections)
    total_sementes = sum(d.total for d in detections)
    total_inteiras = sum(d.inteiras for d in detections)
    total_quebradas = sum(d.quebradas for d in detections)
    total_predadas = sum(d.predadas for d in detections)
    aproveitamento = round((total_inteiras / total_sementes * 100), 1) if total_sementes > 0 else 0

    ultima_analise = None
    if detections:
        ultima = max(detections, key=lambda d: d.id)
        ultima_analise = str(ultima.created_at) if ultima.created_at else None

    return {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "total_analises": total_analises,
        "total_sementes": total_sementes,
        "total_inteiras": total_inteiras,
        "total_quebradas": total_quebradas,
        "total_predadas": total_predadas,
        "aproveitamento_geral": aproveitamento,
        "ultima_analise": ultima_analise,
    }