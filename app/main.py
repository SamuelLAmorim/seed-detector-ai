from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS, STORAGE_DIR
from app.database import init_db
from app.routes import analysis, users

Path(STORAGE_DIR).mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Seed Detector Pro API")

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
    return {"message": "API de deteccao de sementes online"}
