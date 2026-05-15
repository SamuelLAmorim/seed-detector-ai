# SeeDetector AI
![GitHub repo size](https://img.shields.io/github/repo-size/SamuelLAmorim/PrecisionCert-Centelha?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/SamuelLAmorim/PrecisionCert-Centelha?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/SamuelLAmorim/PrecisionCert-Centelha?style=for-the-badge)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

> Aplicacao full-stack para analise de qualidade de sementes com FastAPI, React e modelo YOLO. inteligente para certificação e análise de qualidade de sementes utilizando Inteligência Artificial e Visão Computacional.

---


## 🚀 Proposta de Valor

O **SeeDetector AI** automatiza a análise de qualidade de sementes, substituindo processos manuais, subjetivos e demorados por uma solução digital, rápida e escalável.

Com o uso de modelos de **Deep Learning (YOLO)**, a plataforma permite:

- 📸 Identificação automática de sementes  
- 📊 Geração de métricas em tempo real  
- 📁 Registro e rastreabilidade de análises  
- 📈 Apoio à tomada de decisão no agronegócio  

---

## 🌾 Problema

A avaliação da qualidade de sementes ainda depende de:

- Análise manual  
- Alto custo operacional  
- Baixa padronização  
- Suscetibilidade a erro humano  

👉 Impacta diretamente produtividade e qualidade no agro.

---

## 💡 Solução

O SeeDetector AI oferece:

- Detecção automática de sementes **Inteiras, Quebradas e Predadas**  
- Interface web simples e acessível  
- Processamento rápido com IA  
- Exportação de relatórios  

---

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

---

## 📊 Funcionalidades

- 📤 Upload de imagens  
- 🎚️ Ajuste de confiança (*threshold*)  
- 📊 Dashboard com gráficos  
- 🧾 Exportação CSV  
- 🔐 Autenticação JWT  
- 🗂️ Histórico de análises  

---

## 🧪 Classificação Inteligente

O modelo de IA realiza a identificação automática das sementes em três categorias:

| Classe | Descrição |
|--------|----------|
| 🌱 Inteira | Sementes saudáveis e aptas para plantio |
| 🪨 Quebrada | Sementes com danos estruturais |
| 🐛 Predada | Sementes comprometidas por pragas |

👉 A classificação é feita em tempo real utilizando visão computacional baseada em YOLO.

---

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
- `VITE_MAX_UPLOAD_BYTES`

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
- `MAX_UPLOAD_BYTES`
- `CORS_ORIGINS`
- `MODEL_PATH`
- `ALLOW_MODEL_FALLBACK`
- `MODEL_FALLBACK_NAME`
- `VITE_API_BASE_URL`
- `VITE_MAX_UPLOAD_BYTES`
- `API_PORT`
- `FRONTEND_PORT`

## Estado atual

O projeto esta pronto para desenvolvimento local e mais consistente para deploy, mas ainda vale evoluir com testes automatizados e pipeline de CI/CD.


## 📄 Licença

© 2026 SeeDetector AI. Desenvolvido por Samuel Amorim.  
Todos os direitos reservados.
