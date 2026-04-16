# 🌱 Seed Detector AI

![GitHub repo size](https://img.shields.io/github/repo-size/SamuelLAmorim/seed-detector-ai?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/SamuelLAmorim/seed-detector-ai?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/SamuelLAmorim/seed-detector-ai?style=for-the-badge)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

> Uma solução inteligente Full-Stack para classificação e análise de qualidade de sementes usando Visão Computacional de ponta.

---

## 🎯 Sobre o Projeto

O **Seed Detector AI** foi desenvolvido para automatizar o processo de triagem de sementes. Utilizando o modelo **YOLOv11**, o sistema é capaz de identificar em tempo real sementes **Inteiras**, **Quebradas** e **Predadas**, fornecendo métricas precisas para controle de qualidade agrícola ou pesquisas científicas.

### 🎥 Demonstração das Funcionalidades

- 📤 Upload de imagens  
- 🎚️ Ajuste de confiança (*threshold*)  
- 📊 Dashboard com gráficos  
- 🧾 Exportação CSV  
- 🔐 Autenticação JWT  
- 🗂️ Histórico de análises  

---
## 🚀 Proposta de Valor

O **SeeDetector AI** automatiza a análise de qualidade de sementes, substituindo processos manuais, subjetivos e demorados por uma solução digital, rápida e escalável.

Com o uso de modelos de **Deep Learning (YOLO)**, a plataforma permite:

- 📸 Identificação automática de sementes  
- 📊 Geração de métricas em tempo real  
- 📁 Registro e rastreabilidade de análises  
- 📈 Apoio à tomada de decisão no agronegócio  

---
## 🧪 Classificação Inteligente

O modelo de IA realiza a identificação automática das sementes em três categorias:

| Classe | Descrição |
|--------|----------|
| 🌱 Inteira | Sementes saudáveis e aptas para plantio |
| 🪨 Quebrada | Sementes com danos estruturais |
| 🐛 Predada | Sementes comprometidas por pragas |

👉 A classificação é feita em tempo real utilizando visão computacional baseada em YOLO.

### ✔️ Status de Desenvolvimento

- **Casual:** ✔️ Implementado  
- **RGN, RGB, NIR, RE:** 🔧 Em Desenvolvimento 

---


## 🛠️ Tecnologias e Ferramentas

| Frontend | Backend | IA & Dados | Infra |
| :--- | :--- | :--- | :--- |
| **React.js** | **FastAPI** | **YOLOv11** | **Docker** |
| **Chart.js** | **SQLModel** | **PostgreSQL** | **Docker Compose** |
| **Axios** | **JWT Auth** | **Ultralytics** | **Nginx** |

---

## 🚀 Como Executar o Projeto

### 📋 Pré-requisitos
Antes de começar, você precisará ter instalado em sua máquina:
* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)

### 🔧 Instalação

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/SamuelLAmorim/seed-detector-ai.git](https://github.com/SamuelLAmorim/seed-detector-ai.git)
   cd seed-detector-ai

2. **Configuração de Ambiente:**
   ```bash
   # Gere uma Secret Key segura com o comando:
   python -c "import secrets; print(secrets.token_hex(32))"

3. **Suba a aplicação com o Docker**
   ```bash
   docker-compose up --build

4. **Acesse no seu navegador**
- Frontend -> (http://localhost:5173)
- Documentação da API(Swagger) -> (http://localhost:8000/docs)

### 📂 Estrutura do Repositório
   
   ├── frontend/          # Aplicação React e Estilização
   
   ├── backend/           # API FastAPI e Lógica da IA (YOLO)
   
   ├── storage/           # Armazenamento local de imagens analisadas
   
   ├── docker-compose.yml # Orquestração dos containers
   
   └── .env.example       # Modelo de variáveis de ambiente

### 🛡️ Segurança
Este projeto utiliza boas práticas de segurança:

- As chaves de API e credenciais de banco de dados são gerenciadas via variáveis de ambiente.
- O arquivo .env está devidamente listado no .gitignore para evitar vazamentos no GitHub.
- Autenticação de usuários protegida por JWT (JSON Web Tokens).

### 🤝 Contribuição
Contribuições são o que fazem a comunidade open source um lugar incrível para aprender, inspirar e criar.

1. Faça um Fork do projeto.
2. Crie uma Branch para sua modificação (git checkout -b feature/NovaFeature).
3. Faça o Commit das alterações (git commit -m 'Add: Nova Feature').
4. Envie para o GitHub (git push origin feature/NovaFeature).
5. Abra um Pull Request.

### 👤 Autor
Desenvolvido com ☕ e 🐍 por Samuel.
Sinta-se à vontade para entrar em contato!