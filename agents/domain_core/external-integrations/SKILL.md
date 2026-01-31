---
name: muebleria-integrations
description: >
  External API integrations (MercadoPago, emails, etc.) for MuebleriaIris.
  Trigger: When integrating external APIs, payment gateways, or third-party services.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Integrating MercadoPago"
    - "Sending emails"
    - "Working with external APIs"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-integrations

## Cuándo usar

Usa esta habilidad cuando:

- Integres MercadoPago para pagos
- Envíes correos transaccionales
- Consumas APIs externas
- Implementes webhooks
- Manejes errores de API y reintentos

---

## Patrones Críticos

### Patrón 1: Integración MercadoPago

```python
# backend/app/integrations/mercadopago.py
import mercadopago
import os

sdk = mercadopago.SDK(os.environ.get('MERCADOPAGO_ACCESS_TOKEN'))

def create_payment_preference(order_id: int, items: list, total: float):
    """Crear preferencia de pago MercadoPago"""
    preference_data = {
        "items": [
            {
                "title": item['nombre'],
                "quantity": item['cantidad'],
                "unit_price": float(item['precio'])
            }
            for item in items
        ],
        "back_urls": {
            "success": f"{os.environ.get('FRONTEND_URL')}/pago/success",
            "failure": f"{os.environ.get('FRONTEND_URL')}/pago/failure",
            "pending": f"{os.environ.get('FRONTEND_URL')}/pago/pending"
        },
        "auto_return": "approved",
        "external_reference": str(order_id),
        "notification_url": f"{os.environ.get('BACKEND_URL')}/api/webhooks/mercadopago"
    }
    
    preference_response = sdk.preference().create(preference_data)
    preference = preference_response["response"]
    
    return preference

# Uso en ruta
@main.route('/api/ordenes/<int:id>/pagar', methods=['POST'])
@jwt_required()
def create_payment(id):
    orden = Orden.query.get_or_404(id)
    
    # Obtener ítems de la orden
    items = [{
        'nombre': d.producto.nombre,
        'cantidad': d.cantidad,
        'precio': d.precio_unitario
    } for d in orden.detalles]
    
    # Crear preferencia
    preference = create_payment_preference(
        orden.id_orden,
        items,
        float(orden.monto_total)
    )
    
    # Guardar ID preferencia
    pago = Pago(
        id_orden=orden.id_orden,
        mp_preference_id=preference['id']
    )
    db.session.add(pago)
    db.session.commit()
    
    return jsonify({
        'preference_id': preference['id'],
        'init_point': preference['init_point']  # URL para checkout
    }), 200
```

### Patrón 2: Webhook MercadoPago

```python
# backend/app/routes.py
@main.route('/api/webhooks/mercadopago', methods=['POST'])
def mercadopago_webhook():
    """Manejar notificaciones MercadoPago"""
    data = request.get_json()
    
    if data.get('type') == 'payment':
        payment_id = data['data']['id']
        
        # Obtener info pago de MercadoPago
        payment_info = sdk.payment().get(payment_id)
        payment = payment_info['response']
        
        # Actualizar orden
        external_ref = payment.get('external_reference')
        if external_ref:
            orden = Orden.query.get(int(external_ref))
            
            if payment['status'] == 'approved':
                orden.estado = 'pagada'
                
                # Actualizar registro pago
                pago = Pago.query.filter_by(id_orden=orden.id_orden).first()
                pago.mp_payment_id = payment_id
                pago.mp_estado = 'approved'
                pago.mp_tipo_pago = payment['payment_type_id']
                pago.monto_cobrado_mp = payment['transaction_amount']
                
                db.session.commit()
                
                app.logger.info(f'Payment approved for order {orden.id_orden}')
    
    return jsonify({'status': 'ok'}), 200
```

---

## Integración de Email

### Patrón 3: Envío de Emails

```python
# backend/app/integrations/email.py
from flask_mail import Mail, Message
import os

mail = Mail()

def send_order_confirmation(order_id: int, customer_email: str):
    """Enviar email de confirmación de orden"""
    orden = Orden.query.get(order_id)
    
    msg = Message(
        subject=f'Confirmación de Orden #{orden.id_orden}',
        sender=os.environ.get('MAIL_DEFAULT_SENDER'),
        recipients=[customer_email]
    )
    
    msg.html = f"""
    <h1>¡Gracias por tu compra!</h1>
    <p>Tu orden #{orden.id_orden} ha sido recibida.</p>
    <p>Total: ${orden.monto_total}</p>
    <p>Estado: {orden.estado}</p>
    """
    
    mail.send(msg)

# backend/app/__init__.py
from flask_mail import Mail

mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    
    mail.init_app(app)
    return app
```

---

## Patrones de API Externa

### Patrón 4: Cliente API con Reintento

```python
# backend/app/integrations/api_client.py
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session_with_retry():
    """Crear sesión con reintentos automáticos"""
    session = requests.Session()
    
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"]
    )
    
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    return session

def call_external_api(endpoint: str, data: dict = None):
    """Llamar API externa con manejo de errores"""
    session = create_session_with_retry()
    
    try:
        response = session.get(
            endpoint,
            json=data,
            timeout=10
        )
        response.raise_for_status()
        return response.json()
        
    except requests.exceptions.Timeout:
        app.logger.error(f'Timeout calling {endpoint}')
        raise
        
    except requests.exceptions.RequestException as e:
        app.logger.error(f'Error calling {endpoint}: {str(e)}')
        raise
```

---

## Integración Frontend

### Patrón 5: Checkout MercadoPago

```tsx
// src/components/CheckoutButton.tsx
"use client";
import { useState } from 'react';

interface CheckoutButtonProps {
  orderId: number;
}

export function CheckoutButton({ orderId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/ordenes/${orderId}/pagar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      
      // Redirigir a MercadoPago
      window.location.href = data.init_point;
      
    } catch (error) {
      alert('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
    >
      {loading ? 'Procesando...' : 'Pagar con MercadoPago'}
    </button>
  );
}
```

---

## Variables de Entorno

```bash
# backend/.env

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
MERCADOPAGO_PUBLIC_KEY=tu-public-key

# Email (Ejemplo Gmail)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-aplicacion
MAIL_DEFAULT_SENDER=noreply@muebleriairis.com

# URLs
FRONTEND_URL=http://localhost:4321
BACKEND_URL=http://localhost:5000
```

---

## Mejores Prácticas

### SÍ:
- Usar variables de entorno para credenciales
- Implementar lógica de reintento para errores transitorios
- Loggear todas las llamadas API externas
- Validar firmas de webhooks
- Manejar timeouts con gracia
- Usar async para operaciones no bloqueantes
- Cachear respuestas cuando sea apropiado

### NO:
- Hardcodear claves API
- Exponer URLs de webhooks públicamente sin verificación
- Hacer llamadas síncronas a APIs lentas
- Ignorar límites de tasa (rate limits)
- Guardar datos sensibles en logs
- Confiar en datos externos sin validación

---

## Comandos

```bash
# Instalar dependencias
pip install mercadopago flask-mail requests

# Probar webhook localmente (ngrok)
ngrok http 5000
# Usar URL de ngrok para notification_url
```

---

## Checklist de QA

- [ ] Claves API en variables de entorno
- [ ] Lógica de reintento para errores transitorios
- [ ] Timeouts configurados
- [ ] Errores loggeados con contexto
- [ ] Validación de firma de webhook
- [ ] Datos externos validados
- [ ] Límites de tasa respetados
- [ ] Fallbacks para llamadas fallidas

---

## Recursos

- **SDK MercadoPago**: https://www.mercadopago.com.ar/developers
- **Flask-Mail**: https://pythonhosted.org/Flask-Mail/
- **Requests**: https://requests.readthedocs.io
