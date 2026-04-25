import base64
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

from app.config import ALLOW_MODEL_FALLBACK, MODEL_FALLBACK_NAME, MODEL_PATH


class SeedDetector:
    def __init__(self, model_path: Path = MODEL_PATH):
        resolved_model = Path(model_path)

        if resolved_model.exists():
            self.model = YOLO(str(resolved_model))
            self.model_name = resolved_model.name
            print(f"--- Modelo carregado com sucesso: {resolved_model} ---")
            print(f"--- Classes detectadas: {self.model.names} ---")
            return

        if ALLOW_MODEL_FALLBACK:
            print(f"--- AVISO: modelo principal nao encontrado. Usando fallback {MODEL_FALLBACK_NAME}. ---")
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
            class_name = str(self.model.names[cls_id]).lower()

            if "inteira" in class_name:
                counts["inteira"] += 1
            elif "quebrada" in class_name:
                counts["quebrada"] += 1
            elif "predada" in class_name or "pedrada" in class_name or "bug" in class_name or "pred" in class_name:
                counts["predada"] += 1
            else:
                print(f"--- AVISO: classe desconhecida: '{class_name}' ---")

        annotated_img = results.plot()
        success, buffer = cv2.imencode(".jpg", annotated_img, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if not success:
            raise RuntimeError("Nao foi possivel gerar a imagem anotada.")

        annotated_b64 = base64.b64encode(buffer).decode("utf-8")
        return counts, annotated_b64, self.model_name
