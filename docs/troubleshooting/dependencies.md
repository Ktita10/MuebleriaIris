# 📦 Análisis de Dependencias - MuebleriaIris

## 🔍 Estado Actual

### Backend (Python/Flask)

#### ✅ Dependencias Instaladas (requirements.txt)
```
Flask
flask-sqlalchemy
psycopg2-binary
python-dotenv
flask-cors
```

#### ❌ Dependencias FALTANTES (requeridas por los skills)

**Críticas para Producción:**
1. **flask-jwt-extended** - JWT authentication (muebleria-security)
2. **bcrypt** o **flask-bcrypt** - Password hashing (muebleria-security)
3. **gunicorn** - Production server (muebleria-deployment)
4. **mercadopago** - MercadoPago SDK (muebleria-integrations)
5. **Flask-Mail** - Email sending (muebleria-integrations)

**Para Testing:**
6. **pytest** - Testing framework (muebleria-test-api)
7. **pytest-flask** - Flask testing utilities

**Útiles:**
8. **requests** - HTTP client para APIs externas (muebleria-integrations)
9. **python-decouple** - Better env variables (alternativa a python-dotenv)

---

### Frontend (Node/Astro/React)

#### ✅ Dependencias Instaladas (package.json)
```json
{
  "@astrojs/react": "^4.4.2",
  "@tailwindcss/vite": "^4.1.17",
  "astro": "^5.16.4",
  "react": "^19.2.1",
  "react-dom": "^19.2.1",
  "tailwindcss": "^4.1.17"
}
```

#### ❌ Dependencias FALTANTES (requeridas por los skills)

**Críticas para Producción:**
1. **react-hook-form** - Form management (muebleria-forms)
2. **zod** - Schema validation (muebleria-forms)
3. **@hookform/resolvers** - Zod + react-hook-form integration

**Para Testing:**
4. **@playwright/test** - E2E testing (muebleria-test-ui)
5. **@testing-library/react** - Component testing (muebleria-test-ui)
6. **@testing-library/jest-dom** - Testing utilities
7. **vitest** - Unit testing framework

**Útiles:**
8. **clsx** - Conditional className utility
9. **@types/node** - Node.js type definitions

---

## 🚀 Script de Instalación

### Backend
```bash
# Navegar al backend
cd backend

# Actualizar requirements.txt con dependencias críticas
pip install flask-jwt-extended flask-bcrypt gunicorn mercadopago Flask-Mail requests pytest pytest-flask

# Generar nuevo requirements.txt
pip freeze > requirements.txt
```

### Frontend
```bash
# Navegar a raíz del proyecto
cd ..

# Instalar dependencias de producción
npm install react-hook-form zod @hookform/resolvers

# Instalar dependencias de desarrollo
npm install -D @playwright/test @testing-library/react @testing-library/jest-dom vitest clsx @types/node
```

---

## 📋 Actualización de requirements.txt

Reemplaza `backend/requirements.txt` con:

```txt
# Core Flask
Flask==3.0.0
flask-sqlalchemy==3.1.1
flask-cors==4.0.0

# Database
psycopg2-binary==2.9.9
SQLAlchemy==2.0.23

# Authentication & Security
flask-jwt-extended==4.6.0
flask-bcrypt==1.0.1

# Environment Variables
python-dotenv==1.0.0

# Integrations
mercadopago==2.2.1
Flask-Mail==0.9.1
requests==2.31.0

# Production Server
gunicorn==21.2.0

# Testing
pytest==7.4.3
pytest-flask==1.3.0
```

---

## 📋 Actualización de package.json

Agrega a `package.json`:

```json
{
  "dependencies": {
    "@astrojs/react": "^4.4.2",
    "@hookform/resolvers": "^3.3.4",
    "@tailwindcss/vite": "^4.1.17",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "astro": "^5.16.4",
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "react-hook-form": "^7.50.0",
    "tailwindcss": "^4.1.17",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@playwright/test": "^1.41.0",
    "@testing-library/jest-dom": "^6.2.0",
    "@testing-library/react": "^14.1.2",
    "@types/node": "^20.11.0",
    "clsx": "^2.1.0",
    "vitest": "^1.2.0"
  }
}
```

---

## ⚡ Comando Rápido de Instalación

```bash
# Backend
cd backend
pip install flask-jwt-extended flask-bcrypt gunicorn mercadopago Flask-Mail requests pytest pytest-flask
pip freeze > requirements.txt
cd ..

# Frontend
npm install react-hook-form zod @hookform/resolvers
npm install -D @playwright/test @testing-library/react @testing-library/jest-dom vitest clsx @types/node

# Inicializar Playwright
npx playwright install
```

---

## 🔧 Verificación Post-Instalación

### Backend
```bash
cd backend
python -c "import flask_jwt_extended; print('✅ JWT OK')"
python -c "import flask_bcrypt; print('✅ Bcrypt OK')"
python -c "import mercadopago; print('✅ MercadoPago OK')"
python -c "import flask_mail; print('✅ Mail OK')"
python -c "import pytest; print('✅ Pytest OK')"
```

### Frontend
```bash
npm list react-hook-form zod @hookform/resolvers @playwright/test
```

---

## 📊 Resumen

| Componente | Instaladas | Faltantes | Críticas |
|------------|-----------|-----------|----------|
| Backend | 5 | 9 | 5 |
| Frontend | 6 | 9 | 3 |

**Prioridad ALTA**: Instalar las 8 dependencias críticas (5 backend + 3 frontend)

---

## 🎯 Próximos Pasos

1. ✅ Revisar este análisis
2. ⏳ Ejecutar script de instalación
3. ⏳ Verificar imports
4. ⏳ Actualizar archivos requirements.txt y package.json
5. ⏳ Probar que todo funciona

¿Proceder con la instalación?
