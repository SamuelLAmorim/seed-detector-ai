import cv2
import numpy as np
from ultralytics import YOLO
import os

class SeedDetector:
    def __init__(self, model_path: str = "models/best.pt"):
        if os.path.exists(model_path):
            self.model = YOLO(model_path)
            print(f"--- Modelo carregado com sucesso: {model_path} ---")
            print(f"--- Classes detectadas: {self.model.names} ---")
        else:
            print("--- AVISO: models/best.pt não encontrado. Usando yolov11n.pt ---")
            self.model = YOLO("yolov11n.pt")

    def predict(self, image_bytes, conf=0.25):
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        results = self.model(img, conf=conf)[0]

        counts = {"inteira": 0, "pedrada": 0, "quebrada": 0}

        for box in results.boxes:
            cls_id = int(box.cls[0].item())
            class_name = self.model.names[cls_id].lower()

            if "inteira" in class_name:
                counts["inteira"] += 1
            elif "quebrada" in class_name:
                counts["quebrada"] += 1
            elif "pedrada" in class_name or "bug" in class_name or "pred" in class_name:
                counts["pedrada"] += 1
            else:
                # Loga classes desconhecidas em vez de classificar errado
                print(f"--- AVISO: classe desconhecida detectada: '{class_name}' ---")

        annotated_img = results.plot()
        return counts, annotated_img