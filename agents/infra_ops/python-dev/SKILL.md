---
name: muebleria-python
description: >
  Python development patterns for MuebleriaIris backend.
  Trigger: When writing Python code in backend/, working with Flask, or managing dependencies.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Writing Python backend code"
    - "Managing Python dependencies"
    - "Setting up virtual environments"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-python

## Cuándo usar

Usa esta habilidad cuando:

- Escribas código Python para el backend Flask
- Gestiones dependencias con pip/requirements.txt
- Configures entornos virtuales
- Depures errores de Python
- Sigas mejores prácticas de Python

---

## Stack Tecnológico

```
Python 3.9+ | Flask 3.0+ | SQLAlchemy 2.0+
Entornos virtuales (venv) | pip
```

---

## Patrones Críticos

### Patrón 1: Configuración de Entorno Virtual

```bash
# Crear venv
python3 -m venv backend/venv

# Activar (Linux/Mac)
source backend/venv/bin/activate

# Activar (Windows)
backend\venv\Scripts\activate

# Instalar dependencias
pip install -r backend/requirements.txt

# Congelar dependencias
pip freeze > backend/requirements.txt
```

### Patrón 2: Estructura de Importación

```python
# Importaciones de biblioteca estándar
from datetime import datetime, timezone
import os

# Importaciones de terceros
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Importaciones locales
from . import db
from .models import Producto, Cliente
```

### Patrón 3: Manejo de Errores

```python
try:
    # Operación de base de datos
    db.session.add(nuevo_producto)
    db.session.commit()
    return jsonify({'mensaje': 'Éxito'}), 201
except Exception as e:
    db.session.rollback()
    return jsonify({'error': str(e)}), 500
```

---

## Estilo de Código

### Convenciones de Nombramiento

```python
# Variables y funciones: snake_case
nombre_producto = "Sofá"
def crear_producto():
    pass

# Clases: PascalCase
class Producto(db.Model):
    pass

# Constantes: UPPER_SNAKE_CASE
API_BASE_URL = "http://localhost:5000"
```

### Docstrings

```python
def create_orden(data):
    """
    Crea una nueva orden de venta.
    
    Args:
        data (dict): Datos de la orden con id_cliente e items
        
    Returns:
        tuple: (response_json, status_code)
        
    Raises:
        ValueError: Si el stock es insuficiente
    """
    pass
```

---

## Tareas Comunes

### Variables de Entorno

```python
# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DB_USER = os.environ.get('DB_USER', 'postgres')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    SQLALCHEMY_DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASSWORD}@localhost/muebleria_erp'
```

### Patrón Factory de Flask

```python
# backend/app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    db.init_app(app)
    CORS(app)
    
    from .routes import main
    app.register_blueprint(main)
    
    return app
```

---

## Depuración

```python
# Print debugging (solo desarrollo)
print(f"DEBUG: {variable}")

# Modo debug Flask (backend/run.py)
if __name__ == "__main__":
    app.run(debug=True)

# Debugger Python
import pdb; pdb.set_trace()
```

---

## Comandos

```bash
# Ejecutar app Flask
python backend/run.py

# REPL Python
python

# Verificar versión Python
python --version

# Instalar paquete específico
pip install flask-cors

# Desinstalar paquete
pip uninstall flask-cors

# Listar paquetes instalados
pip list
```

---

## Checklist de QA

- [ ] Usar type hints para parámetros de función
- [ ] Manejar excepciones con try/except
- [ ] Usar variables de entorno para datos sensibles
- [ ] Seguir guía de estilo PEP 8
- [ ] Agregar docstrings a funciones
- [ ] Usar entorno virtual (nunca pip global)
- [ ] Mantener requirements.txt actualizado

---

## Recursos

- **PEP 8**: Guía de estilo Python
- **Docs Flask**: https://flask.palletsprojects.com
- **SQLAlchemy**: https://www.sqlalchemy.org
