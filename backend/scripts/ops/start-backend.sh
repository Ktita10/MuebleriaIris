#!/bin/bash
# Script para iniciar el backend de MuebleriaIris
# Ejecutar con: bash start-backend.sh

echo "🚀 Iniciando Backend de MuebleriaIris..."
echo ""

# Ir al directorio backend
cd "$(dirname "$0")"
echo "📁 Directorio actual: $(pwd)"
echo ""

# Verificar conexión a base de datos
echo "🗄️  Verificando conexión a base de datos..."
PGPASSWORD=12345 psql -U postgres -h localhost -p 5433 -d muebleria_erp -c "SELECT 'Conexión exitosa' as test;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Base de datos conectada"
else
    echo "❌ Error: No se puede conectar a la base de datos"
    echo "   Verifica que PostgreSQL esté corriendo en el puerto 5433"
    exit 1
fi
echo ""

# Iniciar servidor Flask con el Python del venv
echo "🏭 Iniciando servidor Flask..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
venv/bin/python3 run.py
