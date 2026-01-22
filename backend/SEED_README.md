# Script de Datos de Prueba - MuebleriaIris

Este script poblará la base de datos con datos realistas de prueba para facilitar el testing y desarrollo.

## Datos que se crearán:

### 👥 Usuarios (4)
- **Administrador**: admin@muebleria.com / admin123
- **Vendedores** (2): maria@muebleria.com, carlos@muebleria.com / vendedor123
- **Inventario**: ana@muebleria.com / inventario123

### 👤 Clientes (5)
Clientes con datos completos (DNI/CUIT, dirección, teléfono, provincia, etc.)

### 🏷️ Categorías (5)
- Sofás
- Sillas
- Mesas
- Camas
- Estanterías

### 📦 Productos (15)
- 3 Sofás
- 3 Mesas
- 3 Sillas
- 3 Camas
- 3 Estanterías

Cada producto incluye: SKU, descripción, precio, dimensiones, material, categoría

### 🏭 Proveedores (3)
Proveedores con datos de contacto completos

### 📊 Inventario
Stock aleatorio (5-50 unidades) para cada producto con ubicación en depósito

### 🛒 Órdenes (10)
Órdenes con fechas de los últimos 30 días, estados variados (pendiente, en_proceso, completada)

---

## 🚀 Cómo ejecutar:

### 1. Asegúrate de que la base de datos existe:
```bash
# En PostgreSQL
CREATE DATABASE muebleria_erp;
```

### 2. Activa el entorno virtual:
```bash
cd backend
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows
```

### 3. Ejecuta el script:
```bash
python seed_data.py
```

### 4. Verifica que se crearon los datos:
El script mostrará un resumen al finalizar con las credenciales de acceso.

---

## ⚠️ ADVERTENCIA

Este script **eliminará todos los datos existentes** en la base de datos antes de crear los nuevos. 

**NO ejecutar en producción.**

---

## 🔍 Verificación

Después de ejecutar el script, puedes verificar los datos:

```bash
# Iniciar el servidor backend
python run.py

# En otra terminal, probar la API
curl http://localhost:5000/api/productos
curl http://localhost:5000/api/clientes
curl http://localhost:5000/api/ordenes
```

O acceder al dashboard admin en: http://localhost:4321/admin

---

## 🐛 Troubleshooting

### Error: "ModuleNotFoundError"
```bash
pip install -r requirements.txt
```

### Error: "OperationalError: database does not exist"
Crear la base de datos primero:
```sql
CREATE DATABASE muebleria_erp;
```

### Error: "Connection refused"
Verificar que PostgreSQL esté corriendo:
```bash
sudo service postgresql start  # Linux
brew services start postgresql # Mac
```

---

## 📝 Notas

- Los productos no incluyen imágenes por defecto
- Las órdenes tienen fechas aleatorias de los últimos 30 días
- El stock de inventario es aleatorio entre 5-50 unidades
- Todos los usuarios tienen contraseñas de prueba (cambiar en producción)
