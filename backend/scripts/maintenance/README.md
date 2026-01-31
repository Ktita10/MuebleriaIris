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
