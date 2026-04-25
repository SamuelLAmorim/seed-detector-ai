from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from jose import JWTError, jwt
from sqlmodel import Session, select

from app.auth import oauth2_scheme
from app.config import ALGORITHM, SECRET_KEY, STORAGE_DIR
from app.database import get_session
from app.detector import SeedDetector
from app.models import (
    AnalysisUploadResponse,
    DeleteResponse,
    Detection,
    DetectionRead,
    ProfileResponse,
    User,
)

router = APIRouter(prefix="/analysis", tags=["Analise"])
detector = SeedDetector()

Path(STORAGE_DIR).mkdir(parents=True, exist_ok=True)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_session),
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token invalido")
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Token invalido") from exc

    user = db.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario nao encontrado")
    return user


@router.post("/upload", response_model=AnalysisUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    conf: float = Query(default=0.25, ge=0.01, le=1.0),
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Envie apenas arquivos de imagem")

    safe_name = Path(file.filename or "imagem.jpg").name
    file_path = Path(STORAGE_DIR) / f"{uuid4().hex}_{safe_name}"
    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Arquivo vazio")

    file_path.write_bytes(image_bytes)

    try:
        counts, annotated_b64, model_name = detector.predict(image_bytes, conf=conf)
    except ValueError as exc:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Falha ao processar a imagem") from exc

    new_detection = Detection(
        inteiras=counts.get("inteira", 0),
        predadas=counts.get("predada", 0),
        quebradas=counts.get("quebrada", 0),
        total=sum(counts.values()),
        modelo_utilizado=model_name,
        confianca_limiar=conf,
        image_path=str(file_path),
        user_id=user.id,
    )

    db.add(new_detection)
    db.commit()
    db.refresh(new_detection)

    return AnalysisUploadResponse(
        inteiras=new_detection.inteiras,
        quebradas=new_detection.quebradas,
        predadas=new_detection.predadas,
        total=new_detection.total,
        id_deteccao=new_detection.id,
        annotated_image=annotated_b64,
    )


@router.get("/history", response_model=list[DetectionRead])
async def get_history(
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    statement = (
        select(Detection)
        .where(Detection.user_id == user.id)
        .order_by(Detection.id.desc())
    )
    history = db.exec(statement).all()
    return [
        DetectionRead(
            id=item.id,
            inteiras=item.inteiras,
            predadas=item.predadas,
            quebradas=item.quebradas,
            total=item.total,
            modelo_utilizado=item.modelo_utilizado,
            confianca_limiar=item.confianca_limiar,
            created_at=item.created_at,
        )
        for item in history
    ]


@router.delete("/{detection_id}", response_model=DeleteResponse)
async def delete_detection(
    detection_id: int,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    detection = db.get(Detection, detection_id)

    if not detection:
        raise HTTPException(status_code=404, detail="Analise nao encontrada")
    if detection.user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissao para deletar esta analise")

    if detection.image_path:
        Path(detection.image_path).unlink(missing_ok=True)

    db.delete(detection)
    db.commit()
    return DeleteResponse(message="Analise deletada com sucesso")


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    detections = db.exec(select(Detection).where(Detection.user_id == user.id)).all()

    total_analises = len(detections)
    total_sementes = sum(d.total for d in detections)
    total_inteiras = sum(d.inteiras for d in detections)
    total_quebradas = sum(d.quebradas for d in detections)
    total_predadas = sum(d.predadas for d in detections)
    aproveitamento = round((total_inteiras / total_sementes * 100), 1) if total_sementes > 0 else 0

    ultima_analise = None
    if detections:
        ultima = max(detections, key=lambda d: d.id or 0)
        ultima_analise = ultima.created_at.isoformat() if ultima.created_at else None

    return ProfileResponse(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        total_analises=total_analises,
        total_sementes=total_sementes,
        total_inteiras=total_inteiras,
        total_quebradas=total_quebradas,
        total_predadas=total_predadas,
        aproveitamento_geral=aproveitamento,
        ultima_analise=ultima_analise,
    )
