import cv2
import numpy as np
from ultralytics import YOLO
import os

class SeedDetector:
    def __init__(self, model_path: str = "models/best.pt"):
        # Verifica se o seu modelo treinado está na pasta certa
        if os.path.exists(model_path):
            self.model = YOLO(model_path)
            print(f"--- Modelo carregado com sucesso: {model_path} ---")
        else:
            # Se não achar o best.pt, usa o padrão do YOLO para a API não cair
            print("--- AVISO: models/best.pt não encontrado. Usando yolov8n.pt ---")
            self.model = YOLO("yolov8n.pt")

    def predict(self, image_bytes, conf=0.25):
        # Transforma os bytes da imagem que vêm da API em formato que o OpenCV entende
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Roda a detecção
        results = self.model(img, conf=conf)[0]
        
        # Dicionário para contar cada tipo de semente
        counts = {"inteira": 0, "predada": 0, "quebrada": 0}
        
        for box in results.boxes:
            cls_id = int(box.cls[0].item())
            class_name = self.model.names[cls_id].lower()
            
            # Lógica para classificar baseado nos nomes das suas classes no YOLO
            if "inteira" in class_name:
                counts["inteira"] += 1
            elif "predada" in class_name or "bug" in class_name:
                counts["predada"] += 1
            else:
                counts["quebrada"] += 1

        # Gera a imagem com os quadradinhos desenhados
        annotated_img = results.plot()
        return counts, annotated_img