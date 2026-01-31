---
name: muebleria-errors
description: >
  Error handling and logging patterns for MuebleriaIris.
  Trigger: When implementing error handling, logging, or debugging features.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Implementing error handling"
    - "Setting up logging"
    - "Creating error boundaries"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-errors

## Cuándo usar

Usa esta habilidad cuando:

- Implementes manejo de errores
- Configures sistemas de logging
- Crees límites de error (Error Boundaries) en React
- Depures problemas
- Monitorees errores en producción

---

## Patrones Críticos

### Patrón 1: Manejo de Errores Backend

```python
# backend/app/errors.py
from flask import jsonify
from werkzeug.exceptions import HTTPException
import logging

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(error):
        logger.warning(f'404: {request.url}')
        return jsonify({'error': 'Recurso no encontrado'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f'500: {str(error)}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        # Loggear todas las excepciones no manejadas
        logger.error(f'Unhandled exception: {str(error)}', exc_info=True)
        
        if isinstance(error, HTTPException):
            return jsonify({'error': error.description}), error.code
        
        return jsonify({'error': 'Error inesperado'}), 500

# backend/app/__init__.py
from .errors import register_error_handlers

def create_app():
    app = Flask(__name__)
    register_error_handlers(app)
    return app
```

### Patrón 2: Configuración de Logging

```python
# backend/app/logging_config.py
import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging(app):
    if not os.path.exists('logs'):
        os.mkdir('logs')
    
    # File handler
    file_handler = RotatingFileHandler(
        'logs/muebleria.log',
        maxBytes=10240000,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG if app.debug else logging.INFO)
    app.logger.addHandler(console_handler)
    
    app.logger.setLevel(logging.INFO)
    app.logger.info('MuebleriaIris startup')
```

### Patrón 3: Patrones Try-Except

```python
# backend/app/routes.py
@main.route('/api/productos', methods=['POST'])
def create_producto():
    try:
        data = request.get_json()
        
        # Validación
        if not data.get('nombre'):
            return jsonify({'error': 'Nombre requerido'}), 400
        
        # Lógica de negocio
        nuevo = Producto(**data)
        db.session.add(nuevo)
        db.session.commit()
        
        app.logger.info(f'Producto creado: {nuevo.id_producto}')
        return jsonify({'producto': nuevo.to_dict()}), 201
        
    except ValueError as e:
        # Errores esperados (validación)
        app.logger.warning(f'Validation error: {str(e)}')
        return jsonify({'error': str(e)}), 400
        
    except KeyError as e:
        # Campo requerido faltante
        app.logger.warning(f'Missing field: {str(e)}')
        return jsonify({'error': f'Campo requerido: {str(e)}'}), 400
        
    except Exception as e:
        # Errores inesperados
        app.logger.error(f'Error creating producto: {str(e)}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': 'Error al crear producto'}), 500
```

---

## Manejo de Errores Frontend

### Patrón 4: Error Boundary (React)

```tsx
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Enviar a servicio de logging
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <h2 className="font-bold">Algo salió mal</h2>
          <p>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Reintentar
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Uso
<ErrorBoundary>
  <ProductList />
</ErrorBoundary>
```

### Patrón 5: Manejo de Errores API

```typescript
// src/lib/apiClient.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new APIError(
        data.error || 'Error en la petición',
        response.status,
        data
      );
    }
    
    return await response.json();
    
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Error de red
    throw new APIError('Error de conexión', 0);
  }
}

// Uso
try {
  const productos = await apiRequest<Producto[]>('http://localhost:5000/api/productos');
} catch (error) {
  if (error instanceof APIError) {
    if (error.status === 404) {
      console.log('No encontrado');
    } else if (error.status === 500) {
      console.log('Error del servidor');
    } else {
      console.log('Error de red');
    }
  }
}
```

---

## Patrones de Logging

```python
# backend/app/routes.py
import logging

logger = logging.getLogger(__name__)

# Niveles de Log
logger.debug('Debugging info')     # Solo desarrollo
logger.info('User logged in')      # Eventos importantes
logger.warning('Stock bajo')       # Advertencias
logger.error('DB error', exc_info=True)  # Errores
logger.critical('System down')     # Errores críticos

# Logging estructurado
logger.info(f'Order created: {order_id}, customer: {customer_id}, total: {total}')

# Log con contexto
try:
    # ...
except Exception as e:
    logger.error(f'Failed to process order {order_id}', exc_info=True)
```

---

## Mensajes de Error Amigables

```python
# ❌ NO: Exponer errores internos
return jsonify({'error': str(e)}), 500  # Muestra stack trace

# ✅ SÍ: Mensajes genéricos para errores inesperados
return jsonify({'error': 'Error al procesar la solicitud'}), 500

# ✅ SÍ: Mensajes específicos para errores esperados
if stock < cantidad:
    return jsonify({'error': 'Stock insuficiente. Disponible: ' + str(stock)}), 400
```

---

## Notificaciones Toast (Frontend)

```tsx
// src/lib/toast.ts
type ToastType = 'success' | 'error' | 'warning' | 'info';

export const toast = {
  success(message: string) {
    // Mostrar toast éxito
    console.log('✅', message);
  },
  
  error(message: string) {
    // Mostrar toast error
    console.error('❌', message);
  },
  
  warning(message: string) {
    console.warn('⚠️', message);
  }
};

// Uso
try {
  await createProduct(data);
  toast.success('Producto creado exitosamente');
} catch (error) {
  toast.error(error.message || 'Error al crear producto');
}
```

---

## Mejores Prácticas

### SÍ:
- Loggear todos los errores con contexto
- Usar niveles de log apropiados
- Sanitizar mensajes de error para usuarios
- Implementar límites de error (boundaries)
- Manejar errores de red
- Revertir transacciones de BD en error
- Monitorear errores en producción

### NO:
- Exponer stack traces a usuarios
- Loggear datos sensibles (contraseñas, tokens)
- Ignorar excepciones
- Mostrar errores técnicos a usuarios
- Dejar que la app crashee sin límites
- Olvidar revertir BD en error

---

## Comandos

```bash
# Ver logs
tail -f backend/logs/muebleria.log

# Buscar errores
grep "ERROR" backend/logs/muebleria.log

# Monitorear en tiempo real
watch -n 1 'tail -20 backend/logs/muebleria.log'
```

---

## Checklist de QA

- [ ] Todos los endpoints API tienen try-except
- [ ] Transacciones BD se revierten en error
- [ ] Mensajes de error amigables
- [ ] Errores loggeados con contexto
- [ ] Límites de error React en su lugar
- [ ] Errores de red manejados
- [ ] Sin datos sensibles en logs
- [ ] Rotación de logs configurada

---

## Recursos

- **Logging Python**: https://docs.python.org/3/library/logging.html
- **React Error Boundaries**: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
