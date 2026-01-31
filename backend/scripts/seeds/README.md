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
