import fastapi
from app.database import init_db
from app.routes import users, analysis
import os
from fastapi.middleware.cors import CORSMiddleware

if not os.path.exists("storage"):
    os.makedirs("storage")

app = fastapi.FastAPI(title="Seed Detector Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# As rotas de análise já estão dentro deste router!
app.include_router(users.router)
app.include_router(analysis.router)

@app.get("/")
def root():
    return {"message": "API de Detecção de Sementes Online"}