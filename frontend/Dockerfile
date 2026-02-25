FROM node:22-alpine

WORKDIR /app

# Instalando dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm install

COPY . .

# O Vite (nosso servidor de front) roda na 5173 por padrão
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]