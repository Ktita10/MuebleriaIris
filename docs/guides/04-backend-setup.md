# 🚀 Cómo Correr el Backend - Paso a Paso

## Opción 1: Script Automático (Recomendado) ⭐

### Paso 1: Abre una Terminal
```bash
Ctrl + Alt + T
```

### Paso 2: Navega a la carpeta del backend
```bash
cd ~/Escritorio/Proyectos/Muebleria/MuebleriaIris/backend
```

### Paso 3: Ejecuta el script
```bash
bash start-backend.sh
```

¡Listo! El backend estará corriendo en **http://localhost:5000**

---

## Opción 2: Paso a Paso Manual 📝

### Paso 1: Abre una Terminal Nueva
```bash
Ctrl + Alt + T
```

### Paso 2: Ve a la carpeta del proyecto
```bash
cd ~/Escritorio/Proyectos/Muebleria/MuebleriaIris/backend
```

### Paso 3: Activa el entorno virtual de Python
```bash
source venv/bin/activate
```

Verás que tu terminal ahora muestra `(venv)` al inicio:
```
(venv) matias-fuentes@tu-pc:~/Escritorio/Proyectos/Muebleria/MuebleriaIris/backend$
```

### Paso 4: Inicia el servidor Flask
```bash
python3 run.py
```

### Paso 5: Verifica que esté corriendo
Deberías ver algo como:
```
============================================================
🏭 MuebleriaIris ERP - Backend API
============================================================
📡 Servidor: http://0.0.0.0:5000
🐛 Debug: True
📊 Base de datos: localhost:5433/muebleria_erp
============================================================

 * Running on http://127.0.0.1:5000
```

✅ **¡El backend está corriendo!**

---

## 🧪 Probar que Funciona

### En otra terminal (sin cerrar la anterior):

```bash
# Probar endpoint raíz
curl http://localhost:5000/

# Probar productos
curl http://localhost:5000/api/productos

# Probar categorías
curl http://localhost:5000/api/categorias
```

O simplemente abre tu navegador y ve a:
- http://localhost:5000/
- http://localhost:5000/api/productos

---

## 🛑 Detener el Servidor

En la terminal donde está corriendo el backend, presiona:
```
Ctrl + C
```

---

## ❌ Solución de Problemas

### Problema 1: "ModuleNotFoundError: No module named 'flask'"

**Solución:**
```bash
cd ~/Escritorio/Proyectos/Muebleria/MuebleriaIris/backend
source venv/bin/activate
pip install -r requirements.txt
```

### Problema 2: "Error al conectar a la base de datos"

**Verifica que PostgreSQL esté corriendo:**
```bash
sudo systemctl status postgresql
```

Si no está corriendo:
```bash
sudo systemctl start postgresql
```

**Verifica la contraseña en .env:**
```bash
cat .env
```

Debe tener:
```
DB_PASSWORD=12345
```

### Problema 3: "Port 5000 already in use"

**Mata el proceso que usa el puerto:**
```bash
lsof -ti:5000 | xargs kill -9
```

Luego intenta correr el backend de nuevo.

---

## 📋 Checklist Rápido

Antes de iniciar el backend, asegúrate de:

- [ ] PostgreSQL está corriendo
- [ ] La base de datos `muebleria_erp` existe
- [ ] El archivo `.env` tiene la contraseña correcta (12345)
- [ ] Estás en la carpeta `backend/`
- [ ] El entorno virtual está activado (`source venv/bin/activate`)

---

## 🎯 Resumen de Comandos

```bash
# 1. Ir a la carpeta
cd ~/Escritorio/Proyectos/Muebleria/MuebleriaIris/backend

# 2. Activar entorno virtual
source venv/bin/activate

# 3. Iniciar servidor
python3 run.py

# 4. Para detener: Ctrl+C
```

---

## 📞 Verificación Rápida

```bash
# En otra terminal, verifica que responde:
curl http://localhost:5000/

# Deberías ver:
# {"nombre": "MuebleriaIris API", "status": "running", "version": "1.0.0"}
```

---

**¿Todo funcionando?** ✅ Ahora puedes conectar el frontend!
