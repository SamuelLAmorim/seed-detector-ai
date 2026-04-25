# Seed Detector AI

Aplicacao full-stack para analise de qualidade de sementes com FastAPI, React e modelo YOLO.

## O que o projeto faz

- Upload de imagens
- Classificacao de sementes inteiras, quebradas e predadas
- Autenticacao JWT
- Historico de analises por usuario
- Dashboard com graficos e exportacao CSV

## Stack

- Frontend: React + Vite + Chart.js
- Backend: FastAPI + SQLModel
- Banco: PostgreSQL
- IA: Ultralytics YOLO
- Infra local: Docker Compose

## Estrutura

- `app/`: API, autenticacao, banco e inferencia
- `frontend/`: interface React
- `models/`: pesos do modelo YOLO
- `storage/`: imagens processadas

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores antes de subir a stack.

Principais variaveis:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- `MODEL_PATH`
- `ALLOW_MODEL_FALLBACK`
- `VITE_API_BASE_URL`

## Como rodar com Docker

```bash
docker-compose up --build
```

Acesse:

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

## Observacoes importantes

- O backend espera encontrar o modelo em `models/best.pt`.
- Se quiser permitir fallback para um modelo generico, defina `ALLOW_MODEL_FALLBACK=true`.
- O frontend usa `VITE_API_BASE_URL` para descobrir a URL da API.
- O CORS nao fica mais aberto para qualquer origem; ajuste `CORS_ORIGINS` conforme o ambiente.

## Deploy no Azure

Para Azure App Service, Container Apps ou pipelines no Azure DevOps, configure pelo menos estas variaveis:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_URL`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `CORS_ORIGINS`
- `MODEL_PATH`
- `ALLOW_MODEL_FALLBACK`
- `MODEL_FALLBACK_NAME`
- `VITE_API_BASE_URL`
- `API_PORT`
- `FRONTEND_PORT`

## Estado atual

O projeto esta pronto para desenvolvimento local e mais consistente para deploy, mas ainda vale evoluir com testes automatizados e pipeline de CI/CD.
