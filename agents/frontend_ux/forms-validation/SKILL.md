---
name: muebleria-forms
description: >
  Forms and validation patterns with react-hook-form + Zod for MuebleriaIris.
  Trigger: When creating forms, validation schemas, or handling form submissions.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Creating forms"
    - "Implementing form validation"
    - "Using react-hook-form"
    - "Working with Zod schemas"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-forms

## Cuándo usar

Usa esta habilidad cuando:

- Crees formularios (login, registro, CRUD)
- Implementes validación (cliente + servidor)
- Uses react-hook-form + Zod
- Manejes envíos de formularios
- Gestiones el estado del formulario

---

## Stack Tecnológico

```
react-hook-form 7.62+ | Zod 4+ | TypeScript
Validación Servidor: Python (backend)
```

---

## Patrones Críticos

### Patrón 1: Formulario con Validación Zod

```tsx
// src/components/forms/ProductForm.tsx
"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Esquema Zod
const productSchema = z.object({
  sku: z.string().min(1, 'SKU requerido').max(50),
  nombre: z.string().min(1, 'Nombre requerido').max(100),
  precio: z.number().positive('Precio debe ser positivo'),
  material: z.string().min(1, 'Material requerido'),
  id_categoria: z.number().int().positive()
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema)
  });
  
  const onSubmit = async (data: ProductFormData) => {
    try {
      const response = await fetch('http://localhost:5000/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Error al crear producto');
        return;
      }
      
      alert('Producto creado exitosamente');
      reset();
      
    } catch (error) {
      alert('Error de conexión');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">SKU</label>
        <input
          {...register('sku')}
          className="w-full p-2 border rounded"
        />
        {errors.sku && (
          <p className="text-red-600 text-sm mt-1">{errors.sku.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          {...register('nombre')}
          className="w-full p-2 border rounded"
        />
        {errors.nombre && (
          <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Precio</label>
        <input
          type="number"
          step="0.01"
          {...register('precio', { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
        {errors.precio && (
          <p className="text-red-600 text-sm mt-1">{errors.precio.message}</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Guardando...' : 'Crear Producto'}
      </button>
    </form>
  );
}
```

---

## Patrones de Validación Zod

```typescript
import { z } from 'zod';

// Validaciones de String
z.string().min(1, 'Campo requerido')
z.string().max(100, 'Máximo 100 caracteres')
z.string().email('Email inválido')
z.string().regex(/^[A-Z]{3}\d{3}$/, 'Formato: ABC123')

// Validaciones de Número
z.number().int('Debe ser entero')
z.number().positive('Debe ser positivo')
z.number().min(0, 'Mínimo 0')
z.number().max(9999, 'Máximo 9999')

// Validaciones Personalizadas
z.string().refine(val => val.length >= 8, {
  message: 'Mínimo 8 caracteres'
})

// Campos Opcionales
z.string().optional()
z.number().nullable()

// Enums
z.enum(['Madera', 'Metal', 'Tela'])

// Objetos
z.object({
  nombre: z.string(),
  edad: z.number()
})

// Arrays
z.array(z.string())
z.array(z.object({ id: z.number() }))

// Uniones
z.union([z.string(), z.number()])

// Transformaciones
z.string().transform(val => val.trim())
z.string().transform(val => val.toLowerCase())
```

---

## Validación Lado Servidor (Backend)

```python
# backend/app/validators.py
from typing import Dict, Any, List

def validate_producto(data: Dict[str, Any]) -> List[str]:
    """Validar datos de producto, retornar lista de errores"""
    errors = []
    
    # Campos requeridos
    if not data.get('sku'):
        errors.append('SKU es requerido')
    elif len(data['sku']) > 50:
        errors.append('SKU máximo 50 caracteres')
    
    if not data.get('nombre'):
        errors.append('Nombre es requerido')
    
    if not data.get('precio'):
        errors.append('Precio es requerido')
    elif data['precio'] <= 0:
        errors.append('Precio debe ser positivo')
    
    return errors

# Uso en ruta
@main.route('/api/productos', methods=['POST'])
def create_producto():
    data = request.get_json()
    
    # Validar
    errors = validate_producto(data)
    if errors:
        return jsonify({'error': ', '.join(errors)}), 400
    
    # Procesar...
```

---

## Ejemplo Formulario Complejo (Creación Orden)

```tsx
// src/components/forms/OrderForm.tsx
"use client";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const orderItemSchema = z.object({
  id_producto: z.number().int().positive(),
  cantidad: z.number().int().positive('Cantidad debe ser mayor a 0')
});

const orderSchema = z.object({
  id_cliente: z.number().int().positive('Cliente requerido'),
  items: z.array(orderItemSchema).min(1, 'Agregue al menos un producto')
});

type OrderFormData = z.infer<typeof orderSchema>;

export function OrderForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [{ id_producto: 0, cantidad: 1 }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });
  
  const onSubmit = async (data: OrderFormData) => {
    // Enviar a API...
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Cliente</label>
        <select {...register('id_cliente', { valueAsNumber: true })}>
          <option value="">Seleccione cliente</option>
          {/* Opciones... */}
        </select>
        {errors.id_cliente && <p className="text-red-600">{errors.id_cliente.message}</p>}
      </div>
      
      <div>
        <h3>Productos</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <select {...register(`items.${index}.id_producto`, { valueAsNumber: true })}>
              <option value="">Producto</option>
            </select>
            
            <input
              type="number"
              {...register(`items.${index}.cantidad`, { valueAsNumber: true })}
              className="w-20"
            />
            
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-600"
            >
              Eliminar
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => append({ id_producto: 0, cantidad: 1 })}
          className="text-blue-600"
        >
          + Agregar Producto
        </button>
      </div>
      
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Crear Orden
      </button>
    </form>
  );
}
```

---

## Estructura de Componentes de Formulario

```
src/components/forms/
├── ProductForm.tsx          # CRUD producto
├── OrderForm.tsx            # Crear orden
├── ClienteForm.tsx          # Registro cliente
├── LoginForm.tsx            # Autenticación
└── schemas/
    ├── productSchema.ts     # Esquemas Zod compartidos
    ├── orderSchema.ts
    └── clienteSchema.ts
```

---

## Mejores Prácticas

### SÍ:
- Validar en cliente Y servidor
- Usar Zod para inferencia de tipos TypeScript
- Mostrar mensajes de error claros
- Deshabilitar botón de envío mientras se envía
- Resetear formulario después de envío exitoso
- Usar `valueAsNumber` para inputs numéricos
- Manejar errores de API con gracia

### NO:
- Confiar solo en validación del lado del cliente
- Enviar sin comprobar isSubmitting
- Ignorar estado de error
- Usar inputs no controlados para formularios complejos
- Olvidar manejar errores de red

---

## Comandos

```bash
# Instalar dependencias
npm install react-hook-form @hookform/resolvers zod
```

---

## Checklist de QA

- [ ] Esquema definido con Zod
- [ ] Validación lado cliente presente
- [ ] Validación lado servidor coincide
- [ ] Mensajes de error son amigables
- [ ] Botón de envío deshabilitado mientras se envía
- [ ] Formulario se resetea tras éxito
- [ ] Estados de carga mostrados
- [ ] Errores de red manejados

---

## Recursos

- **react-hook-form**: https://react-hook-form.com
- **Zod**: https://zod.dev
