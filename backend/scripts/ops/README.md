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
