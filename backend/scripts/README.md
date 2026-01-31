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
