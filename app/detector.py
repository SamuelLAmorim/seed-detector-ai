import base64
import logging
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

from app.config import ALLOW_MODEL_FALLBACK, MODEL_FALLBACK_NAME, MODEL_PATH

logger = logging.getLogger(__name__)

CLASS_ALIASES = {
    "inteira": "inteira",
    "inteiro": "inteira",
    "seed_inteira": "inteira",
    "semente_inteira": "inteira",
    "milho_inteira": "inteira",
    "milho_inteiro": "inteira",
    "quebrada": "quebrada",
    "quebrado": "quebrada",
    "seed_quebrada": "quebrada",
    "semente_quebrada": "quebrada",
    "milho_quebrada": "quebrada",
    "milho_quebrado": "quebrada",
    "predada": "predada",
    "predado": "predada",
    "pedrada": "predada",
    "bug": "predada",
    "seed_predada": "predada",
    "semente_predada": "predada",
    "milho_predada": "predada",
    "milho_predado": "predada",
}


def normalize_class_name(class_name: str) -> str | None:
    normalized = class_name.strip().lower().replace(" ", "_").replace("-", "_")
    return CLASS_ALIASES.get(normalized)


class SeedDetector:
    def __init__(self, model_path: Path = MODEL_PATH):
        resolved_model = Path(model_path)

        if resolved_model.exists():
            self.model = YOLO(str(resolved_model))
            self.model_name = resolved_model.name
            logger.info("Modelo carregado com sucesso: %s", resolved_model)
            logger.info("Classes detectadas: %s", self.model.names)
            return

        if ALLOW_MODEL_FALLBACK:
            logger.warning(
                "Modelo principal nao encontrado. Usando fallback %s.",
                MODEL_FALLBACK_NAME,
            )
            self.model = YOLO(MODEL_FALLBACK_NAME)
            self.model_name = MODEL_FALLBACK_NAME
            return

        raise FileNotFoundError(
            f"Modelo nao encontrado em '{resolved_model}'. Defina MODEL_PATH corretamente ou habilite ALLOW_MODEL_FALLBACK=true."
        )

    def predict(self, image_bytes: bytes, conf: float = 0.25):
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Arquivo enviado nao e uma imagem valida.")

        results = self.model(img, conf=conf)[0]
        counts = {"inteira": 0, "predada": 0, "quebrada": 0}

        for box in results.boxes:
            cls_id = int(box.cls[0].item())
            class_name = str(self.model.names[cls_id])
            category = normalize_class_name(class_name)

            if category:
                counts[category] += 1
            else:
                logger.warning("Classe desconhecida ignorada pelo detector: %s", class_name)

        annotated_img = results.plot()
        success, buffer = cv2.imencode(".jpg", annotated_img, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if not success:
            raise RuntimeError("Nao foi possivel gerar a imagem anotada.")

        annotated_b64 = base64.b64encode(buffer).decode("utf-8")
        return counts, annotated_b64, self.model_name