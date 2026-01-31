---
name: muebleria-deployment
description: >
  Deployment patterns (Docker, environment variables, CI/CD) for MuebleriaIris.
  Trigger: When deploying to production, configuring Docker, or setting up CI/CD.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Deploying to production"
    - "Setting up Docker"
    - "Configuring CI/CD"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-deployment

## Cuándo usar

Usa esta habilidad cuando:

- Despliegues a producción
- Configures contenedores Docker
- Configures variables de entorno
- Crees pipelines de CI/CD
- Configures proxy inverso (Nginx)

---

## Patrones Críticos

### Patrón 1: Docker Compose (Desarrollo)

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "4321:4321"
    environment:
      - VITE_API_URL=http://localhost:5000
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    command: npm run dev
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/muebleria
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - FLASK_ENV=development
    volumes:
      - ./backend:/app
    depends_on:
      - db
    command: flask run --host=0.0.0.0

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=muebleria
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Patrón 2: Dockerfile (Backend)

```dockerfile
# Dockerfile.backend
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar aplicación
COPY backend/ .

# Crear directorio de logs
RUN mkdir -p logs

# Exponer puerto
EXPOSE 5000

# Ejecutar aplicación
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

### Patrón 3: Dockerfile (Frontend)

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Construir
RUN npm run build

# Imagen de producción
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## Variables de Entorno

### Patrón 4: Variables de Entorno (.env)

```bash
# .env.example - Plantilla (commit al repo)
# Copiar a .env y llenar con valores reales (NO COMMITEAR .env)

# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/muebleria

# Flask
SECRET_KEY=tu-clave-secreta-aqui
JWT_SECRET_KEY=tu-secreto-jwt-aqui
FLASK_ENV=production

# Frontend
VITE_API_URL=http://localhost:5000

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu-token-aqui
MERCADOPAGO_PUBLIC_KEY=tu-clave-publica-aqui

# Email
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-aplicacion

# URLs
FRONTEND_URL=https://muebleriairis.com
BACKEND_URL=https://api.muebleriairis.com
```

### Patrón 5: Cargar Variables de Entorno

```python
# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # MercadoPago
    MERCADOPAGO_ACCESS_TOKEN = os.environ.get('MERCADOPAGO_ACCESS_TOKEN')
    MERCADOPAGO_PUBLIC_KEY = os.environ.get('MERCADOPAGO_PUBLIC_KEY')
    
    # Email
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')

# backend/app/__init__.py
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    return app
```

---

## Pipeline CI/CD

### Patrón 6: GitHub Actions

```yaml
# .github/workflows/ci.yml
name: Pipeline CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        run: |
          cd backend
          pytest
  
  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run tests
        run: npm test
  
  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Agregar script de despliegue aquí
          echo "Desplegando a producción..."
```

---

## Configuración Nginx

### Patrón 7: Proxy Inverso Nginx

```nginx
# nginx.conf
server {
    listen 80;
    server_name muebleriairis.com;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Archivos estáticos
    location /static/ {
        alias /app/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Checklist de Producción

### Patrón 8: Checklist Pre-despliegue

```markdown
## Seguridad
- [ ] Archivo .env no commiteado
- [ ] SECRET_KEY y JWT_SECRET_KEY son cadenas aleatorias fuertes
- [ ] Credenciales de base de datos son seguras
- [ ] CORS configurado correctamente
- [ ] HTTPS habilitado (certificado SSL)
- [ ] Cabeceras de seguridad configuradas

## Base de Datos
- [ ] Migraciones actualizadas
- [ ] Estrategia de respaldo de base de datos establecida
- [ ] Connection pooling configurado

## Rendimiento
- [ ] Archivos estáticos comprimidos
- [ ] CDN configurada para imágenes
- [ ] Índices de base de datos creados
- [ ] Estrategia de caché implementada

## Monitoreo
- [ ] Logging de errores configurado
- [ ] Monitoreo de aplicación configurado
- [ ] Monitoreo de uptime configurado
- [ ] Alertas de respaldo configuradas

## Variables de Entorno
- [ ] Todas las variables de entorno configuradas en el servidor
- [ ] FLASK_ENV=production
- [ ] Modo debug deshabilitado
```

---

## Comandos Docker

```bash
# Desarrollo
docker-compose up -d              # Iniciar todos los servicios
docker-compose logs -f backend    # Ver logs del backend
docker-compose exec backend bash  # Entrar al contenedor backend
docker-compose down               # Detener todos los servicios

# Construcción Producción
docker build -f Dockerfile.backend -t muebleria-backend:latest .
docker build -f Dockerfile.frontend -t muebleria-frontend:latest .

# Ejecutar contenedores
docker run -d -p 5000:5000 --env-file .env muebleria-backend:latest
docker run -d -p 80:80 muebleria-frontend:latest

# Respaldo Base de Datos
docker exec postgres pg_dump -U postgres muebleria > backup.sql

# Restaurar Base de Datos
docker exec -i postgres psql -U postgres muebleria < backup.sql
```

---

## Mejores Prácticas

### SÍ:
- Usar variables de entorno para todos los secretos
- Usar `.env.example` como plantilla (commitear)
- Nunca commitear archivo `.env`
- Usar builds multi-stage de Docker
- Configurar health checks
- Usar montajes de volúmenes para desarrollo
- Configurar logging apropiadamente
- Configurar respaldos automáticos

### NO:
- Hardcodear secretos en código
- Usar contraseñas por defecto en producción
- Ejecutar como root en contenedores
- Exponer puertos innecesarios
- Omitir SSL/HTTPS en producción
- Olvidar rotar secretos periódicamente

---

## Checklist de QA

- [ ] Imágenes Docker construyen exitosamente
- [ ] docker-compose.yml funciona localmente
- [ ] Todas las variables de entorno documentadas
- [ ] Pipeline CI/CD pasa
- [ ] Migraciones de base de datos aplicadas
- [ ] HTTPS configurado
- [ ] Monitoreo configurado
- [ ] Estrategia de respaldo establecida

---

## Recursos

- **Docker**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **GitHub Actions**: https://docs.github.com/actions
- **Nginx**: https://nginx.org/en/docs/
