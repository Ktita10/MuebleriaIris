#!/bin/bash

################################################################################
# organize_backend.sh
# 
# Script para limpiar y organizar la estructura del backend siguiendo
# principios de Clean Architecture
#
# Estructura objetivo:
#   backend/
#   ├── app/              (Código de aplicación)
#   ├── alembic/          (Migraciones de BD)
#   ├── tests/            (Pruebas)
#   ├── scripts/          (Scripts útiles)
#   │   └── ops/          (Scripts operativos)
#   ├── run.py            (Entry point)
#   ├── config.py         (Configuración)
#   └── requirements.txt  (Dependencias)
#
# Uso: ./organize_backend.sh
################################################################################

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    MuebleriaIris - Limpieza de Backend (Clean Arch)      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: No se encontró la carpeta 'backend'${NC}"
    echo "   Por favor ejecuta este script desde la raíz del proyecto MuebleriaIris"
    exit 1
fi

echo -e "${YELLOW}📋 Paso 1: Crear estructura de directorios...${NC}"

# Crear carpetas para scripts organizados
mkdir -p backend/scripts/ops
mkdir -p backend/scripts/seeds
mkdir -p backend/scripts/maintenance

echo -e "${GREEN}✓ Estructura de directorios creada${NC}"
echo ""

echo -e "${YELLOW}📦 Paso 2: Mover scripts operativos...${NC}"
echo ""

# Función para mover archivos con feedback
move_file() {
    local source=$1
    local dest=$2
    local category=$3
    
    if [ -f "backend/$source" ]; then
        echo -e "  ${BLUE}→${NC} Moviendo ${source} a ${category}/"
        mv "backend/$source" "backend/$dest/$source"
    else
        echo -e "  ${YELLOW}⚠${NC} No encontrado: ${source} (omitido)"
    fi
}

# ============================================================================
# CATEGORÍA: SEEDS (Scripts de población de datos)
# ============================================================================
echo -e "${BLUE}🌱 Scripts de Seeds (scripts/seeds):${NC}"
move_file "seed_data.py" "scripts/seeds" "scripts/seeds"
move_file "seed_inventario.py" "scripts/seeds" "scripts/seeds"
move_file "seed_ordenes.py" "scripts/seeds" "scripts/seeds"
echo ""

# ============================================================================
# CATEGORÍA: MAINTENANCE (Scripts de mantenimiento)
# ============================================================================
echo -e "${BLUE}🔧 Scripts de Mantenimiento (scripts/maintenance):${NC}"
move_file "check_ordenes.py" "scripts/maintenance" "scripts/maintenance"
move_file "clear_alembic.py" "scripts/maintenance" "scripts/maintenance"
move_file "audit_schema.py" "scripts/maintenance" "scripts/maintenance"
move_file "test_complete_crud.py" "scripts/maintenance" "scripts/maintenance"
echo ""

# ============================================================================
# CATEGORÍA: OPS (Scripts de operaciones - Bash)
# ============================================================================
echo -e "${BLUE}⚙️  Scripts de Operaciones (scripts/ops):${NC}"
move_file "backup_database.sh" "scripts/ops" "scripts/ops"
move_file "restore_database.sh" "scripts/ops" "scripts/ops"
move_file "start-backend.sh" "scripts/ops" "scripts/ops"

# Actualizar permisos de ejecución en scripts .sh
if [ -f "backend/scripts/ops/backup_database.sh" ]; then
    chmod +x backend/scripts/ops/backup_database.sh
fi
if [ -f "backend/scripts/ops/restore_database.sh" ]; then
    chmod +x backend/scripts/ops/restore_database.sh
fi
if [ -f "backend/scripts/ops/start-backend.sh" ]; then
    chmod +x backend/scripts/ops/start-backend.sh
fi
echo ""

# ============================================================================
# CREAR README.md EN CADA CATEGORÍA
# ============================================================================
echo -e "${YELLOW}📝 Paso 3: Crear archivos README.md descriptivos...${NC}"

# scripts/seeds README
cat > backend/scripts/seeds/README.md << 'EOF'
# Scripts de Seeds

Scripts para poblar la base de datos con datos iniciales o de prueba.

## Uso

```bash
# Desde la raíz del proyecto
python backend/scripts/seeds/seed_data.py
python backend/scripts/seeds/seed_inventario.py
python backend/scripts/seeds/seed_ordenes.py
```

## Archivos

- **seed_data.py**: Datos principales (roles, usuarios, categorías, productos, clientes)
- **seed_inventario.py**: Poblar tabla de inventario con stock inicial
- **seed_ordenes.py**: Generar órdenes de prueba

## Notas

- Ejecutar en orden: seed_data.py → seed_inventario.py → seed_ordenes.py
- Verificar conexión a BD antes de ejecutar
- Los scripts son idempotentes (pueden ejecutarse múltiples veces)
EOF

# scripts/maintenance README
cat > backend/scripts/maintenance/README.md << 'EOF'
# Scripts de Mantenimiento

Scripts para mantenimiento, debugging y auditoría del backend.

## Uso

```bash
# Desde la raíz del proyecto
python backend/scripts/maintenance/check_ordenes.py
python backend/scripts/maintenance/clear_alembic.py
python backend/scripts/maintenance/audit_schema.py
```

## Archivos

- **check_ordenes.py**: Verificar integridad de órdenes en BD
- **clear_alembic.py**: Limpiar historial de migraciones Alembic
- **audit_schema.py**: Auditar esquema de base de datos
- **test_complete_crud.py**: Prueba completa de operaciones CRUD

## Notas

- Usar con precaución en producción
- Hacer backup antes de ejecutar scripts destructivos
EOF

# scripts/ops README
cat > backend/scripts/ops/README.md << 'EOF'
# Scripts de Operaciones

Scripts Bash para operaciones de infraestructura y DevOps.

## Uso

```bash
# Backup de base de datos
./backend/scripts/ops/backup_database.sh

# Restaurar base de datos
./backend/scripts/ops/restore_database.sh

# Iniciar backend
./backend/scripts/ops/start-backend.sh
```

## Archivos

- **backup_database.sh**: Crear backup de PostgreSQL
- **restore_database.sh**: Restaurar backup de PostgreSQL
- **start-backend.sh**: Iniciar servidor Flask en desarrollo

## Configuración

Los scripts usan variables de entorno del archivo `.env`:
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
EOF

# scripts README principal
cat > backend/scripts/README.md << 'EOF'
# Scripts del Backend

Colección de scripts organizados por categoría.

## Estructura

```
scripts/
├── seeds/          # Población de datos inicial
├── maintenance/    # Mantenimiento y debugging
└── ops/           # Operaciones de infraestructura
```

## Guías de uso

- **Seeds**: Ver [seeds/README.md](seeds/README.md)
- **Maintenance**: Ver [maintenance/README.md](maintenance/README.md)
- **Ops**: Ver [ops/README.md](ops/README.md)

## Mejores prácticas

1. **Siempre hacer backup** antes de ejecutar scripts destructivos
2. **Probar en desarrollo** antes de usar en producción
3. **Revisar el código** del script antes de ejecutar
4. **Usar entornos virtuales** para aislar dependencias
5. **Verificar variables de entorno** requeridas

## Desarrollo

Al crear nuevos scripts:
- Colocarlos en la categoría apropiada
- Agregar documentación en el encabezado
- Actualizar el README correspondiente
- Hacer el script idempotente cuando sea posible
EOF

echo -e "${GREEN}✓ Archivos README.md creados${NC}"
echo ""

# ============================================================================
# LIMPIAR ARCHIVOS TEMPORALES Y CACHÉ
# ============================================================================
echo -e "${YELLOW}🧹 Paso 4: Limpiar archivos temporales...${NC}"

# Eliminar archivos __pycache__ antiguos en la raíz
if [ -d "backend/__pycache__" ]; then
    rm -rf backend/__pycache__
    echo -e "  ${GREEN}✓${NC} Eliminado __pycache__ de la raíz"
fi

# Eliminar .pyc files sueltos
find backend/ -name "*.pyc" -delete 2>/dev/null && echo -e "  ${GREEN}✓${NC} Eliminados archivos .pyc" || true

echo ""

# ============================================================================
# VERIFICAR ESTRUCTURA FINAL
# ============================================================================
echo -e "${YELLOW}🔍 Paso 5: Verificar estructura final...${NC}"
echo ""

# Archivos que DEBEN permanecer en la raíz
REQUIRED_FILES=("run.py" "config.py" "requirements.txt" "alembic.ini")
ALL_GOOD=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "backend/$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file (en raíz)"
    else
        echo -e "  ${RED}✗${NC} $file (falta en raíz)"
        ALL_GOOD=false
    fi
done

# Directorios que DEBEN existir
REQUIRED_DIRS=("app" "alembic" "tests" "scripts")

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "backend/$dir" ]; then
        echo -e "  ${GREEN}✓${NC} $dir/ (directorio)"
    else
        echo -e "  ${RED}✗${NC} $dir/ (falta directorio)"
        ALL_GOOD=false
    fi
done

echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ Limpieza de backend completada               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║    ⚠️  Limpieza completada con algunas advertencias      ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
echo -e "${BLUE}📊 Estructura final de backend/:${NC}"
echo ""
echo "backend/"
echo "├── app/                  (Código de aplicación)"
echo "├── alembic/              (Migraciones de BD)"
echo "├── tests/                (Pruebas automatizadas)"
echo "├── scripts/"
echo "│   ├── seeds/           (Scripts de población)"
echo "│   ├── maintenance/     (Scripts de mantenimiento)"
echo "│   └── ops/            (Scripts de operaciones)"
echo "├── run.py               (Entry point)"
echo "├── config.py            (Configuración)"
echo "└── requirements.txt     (Dependencias)"
echo ""
echo -e "${YELLOW}⚠️  Próximos pasos:${NC}"
echo "  1. Verificar que los imports en los scripts movidos sigan funcionando"
echo "  2. Actualizar referencias en documentación"
echo "  3. Ejecutar pruebas: pytest backend/tests/"
echo "  4. Verificar que el backend inicie correctamente: python backend/run.py"
echo ""
echo -e "${BLUE}💡 Tip: Los scripts ahora están organizados en backend/scripts/{{seeds,maintenance,ops}}${NC}"
echo ""
