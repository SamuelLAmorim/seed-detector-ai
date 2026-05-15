from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.classification import CLASS_ALIASES
from app.config import ALLOW_MODEL_FALLBACK, CORS_ORIGINS, MAX_UPLOAD_BYTES, MODEL_PATH, STORAGE_DIR
from app.database import init_db
from app.routes import analysis, users
from app.upload_validation import format_bytes_as_mb

Path(STORAGE_DIR).mkdir(parents=True, exist_ok=True)

app = FastAPI(title="SeeDetector AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(users.router)
app.include_router(analysis.router)


@app.get("/")
def root():
    return {"message": "SeeDetector AI API online"}


@app.get("/model-info")
def model_info():
    return {
        "app_name": "SeeDetector AI",
        "model_name": analysis.detector.model_name,
        "model_path": str(MODEL_PATH),
        "classes": analysis.detector.get_class_names(),
        "class_aliases": CLASS_ALIASES,
        "allow_model_fallback": ALLOW_MODEL_FALLBACK,
        "max_upload_bytes": MAX_UPLOAD_BYTES,
        "max_upload_mb": format_bytes_as_mb(MAX_UPLOAD_BYTES),
    }
