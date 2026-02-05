---
name: systematic-debugging
description: 'Guia de depuracion sistematica para encontrar causas raiz antes de aplicar fixes. Usa esta skill cuando tengas bugs, errores de tests, comportamiento inesperado, problemas de rendimiento, o fallos de build. Especialmente importante bajo presion de tiempo o cuando ya probaste multiples soluciones sin exito.'
---

# Depuracion Sistematica

## Resumen

Los fixes aleatorios desperdician tiempo y crean nuevos bugs. Los parches rapidos enmascaran problemas subyacentes.

**Principio fundamental:** SIEMPRE encuentra la causa raiz antes de intentar fixes. Arreglar sintomas es fracasar.

## La Ley de Hierro

```
NO FIXES SIN INVESTIGACION DE CAUSA RAIZ PRIMERO
```

Si no completaste la Fase 1, no puedes proponer fixes.

## Cuando Usar

Usa para CUALQUIER problema tecnico:
- Fallos de tests
- Bugs en produccion
- Comportamiento inesperado
- Problemas de rendimiento
- Fallos de build
- Problemas de integracion

**Usa esto ESPECIALMENTE cuando:**
- Bajo presion de tiempo (las emergencias hacen tentador adivinar)
- "Solo un fix rapido" parece obvio
- Ya intentaste multiples fixes
- El fix anterior no funciono
- No entiendes completamente el problema

## Las Cuatro Fases

DEBES completar cada fase antes de proceder a la siguiente.

### Fase 1: Investigacion de Causa Raiz

**ANTES de intentar CUALQUIER fix:**

1. **Lee los Mensajes de Error Cuidadosamente**
   - No saltes errores o warnings
   - A menudo contienen la solucion exacta
   - Lee stack traces completos
   - Nota numeros de linea, rutas de archivo, codigos de error

2. **Reproduce Consistentemente**
   - Puedes dispararlo de forma confiable?
   - Cuales son los pasos exactos?
   - Sucede cada vez?
   - Si no es reproducible → recopila mas datos, no adivines

3. **Verifica Cambios Recientes**
   - Que cambio que podria causar esto?
   - Git diff, commits recientes
   - Nuevas dependencias, cambios de config
   - Diferencias de entorno

4. **Recopila Evidencia en Sistemas Multi-Componente**
   
   **CUANDO el sistema tiene multiples componentes (API → servicio → base de datos):**
   
   **ANTES de proponer fixes, agrega instrumentacion de diagnostico:**
   
   - Para CADA limite de componente:
     - Loggea que datos entran al componente
     - Loggea que datos salen del componente
     - Verifica propagacion de entorno/config
     - Verifica estado en cada capa
   
   - Ejecuta una vez para recopilar evidencia de DONDE falla
   - LUEGO analiza la evidencia para identificar el componente que falla
   - LUEGO investiga ese componente especifico

5. **Traza el Flujo de Datos**
   
   **CUANDO el error esta profundo en el call stack:**
   
   - Donde se origina el valor malo?
   - Que llamo a esto con el valor malo?
   - Sigue trazando hacia arriba hasta encontrar la fuente
   - Arregla en la fuente, no en el sintoma

### Fase 2: Analisis de Patrones

**Encuentra el patron antes de arreglar:**

1. **Encuentra Ejemplos Funcionando**
   - Localiza codigo similar funcionando en el mismo codebase
   - Que funciona que es similar a lo que esta roto?

2. **Compara Contra Referencias**
   - Si implementas un patron, lee la implementacion de referencia COMPLETAMENTE
   - No ojees - lee cada linea
   - Entiende el patron completamente antes de aplicar

3. **Identifica Diferencias**
   - Que es diferente entre funcionando y roto?
   - Lista cada diferencia, por pequena que sea
   - No asumas "eso no puede importar"

4. **Entiende Dependencias**
   - Que otros componentes necesita esto?
   - Que settings, config, entorno?
   - Que suposiciones hace?

### Fase 3: Hipotesis y Testing

**Metodo cientifico:**

1. **Forma Una Sola Hipotesis**
   - Declara claramente: "Creo que X es la causa raiz porque Y"
   - Escribelo
   - Se especifico, no vago

2. **Prueba Minimamente**
   - Haz el cambio MAS PEQUENO posible para probar la hipotesis
   - Una variable a la vez
   - No arregles multiples cosas a la vez

3. **Verifica Antes de Continuar**
   - Funciono? Si → Fase 4
   - No funciono? Forma NUEVA hipotesis
   - NO agregues mas fixes encima

4. **Cuando No Sabes**
   - Di "No entiendo X"
   - No finjas saber
   - Pide ayuda
   - Investiga mas

### Fase 4: Implementacion

**Arregla la causa raiz, no el sintoma:**

1. **Crea Caso de Test Fallando**
   - Reproduccion mas simple posible
   - Test automatizado si es posible
   - Script de test one-off si no hay framework
   - DEBES tener antes de arreglar

2. **Implementa Un Solo Fix**
   - Aborda la causa raiz identificada
   - UN cambio a la vez
   - Sin mejoras "ya que estoy aqui"
   - Sin refactoring empaquetado

3. **Verifica el Fix**
   - El test pasa ahora?
   - Ningun otro test roto?
   - El problema realmente se resolvio?

4. **Si el Fix No Funciona**
   - PARA
   - Cuenta: Cuantos fixes has intentado?
   - Si < 3: Regresa a Fase 1, re-analiza con nueva informacion
   - **Si >= 3: PARA y cuestiona la arquitectura (paso 5 abajo)**
   - NO intentes Fix #4 sin discusion arquitectonica

5. **Si 3+ Fixes Fallaron: Cuestiona la Arquitectura**
   
   **Patron que indica problema arquitectonico:**
   - Cada fix revela nuevo estado compartido/acoplamiento/problema en lugar diferente
   - Los fixes requieren "refactoring masivo" para implementar
   - Cada fix crea nuevos sintomas en otro lugar
   
   **PARA y cuestiona los fundamentos:**
   - Es este patron fundamentalmente solido?
   - Estamos "quedandonos con el por pura inercia"?
   - Deberiamos refactorizar la arquitectura vs. seguir arreglando sintomas?
   
   **Discute con tu partner humano antes de intentar mas fixes**

## Banderas Rojas - PARA y Sigue el Proceso

Si te encuentras pensando:
- "Fix rapido por ahora, investigo despues"
- "Solo intenta cambiar X y ve si funciona"
- "Agrega multiples cambios, corre tests"
- "Salta el test, verifico manualmente"
- "Probablemente es X, dejame arreglar eso"
- "No entiendo completamente pero esto podria funcionar"
- "El patron dice X pero lo adaptare diferente"
- "Aqui estan los principales problemas: [lista fixes sin investigacion]"
- Proponiendo soluciones antes de trazar flujo de datos
- **"Un intento de fix mas" (cuando ya intentaste 2+)**
- **Cada fix revela nuevo problema en lugar diferente**

**TODOS estos significan: PARA. Regresa a Fase 1.**

**Si 3+ fixes fallaron:** Cuestiona la arquitectura (ver Fase 4.5)

## Ejemplo del Proyecto MuebleriaIris

### Caso: Bucle Infinito de Re-renders en Admin Managers

**Sintoma:** Los componentes UsuariosManager, ProveedoresManager, ClientesManager y CategoriasManager se recargan constantemente (UI congelada).

**Fase 1 - Investigacion:**
1. Los managers usan el hook `useEntityManager`
2. Los handlers usan `useCallback` con `manager` como dependencia
3. El objeto `manager` se recrea en cada render del hook
4. Esto invalida todos los `useCallback` constantemente

**Fase 2 - Analisis de Patron:**
- Comparar con managers estables (InventarioManager, PapeleraManager)
- Diferencia: los estables NO usan hooks custom que retornan objetos

**Fase 3 - Hipotesis:**
"La dependencia `[manager]` en useCallback causa re-renders porque manager es un objeto nuevo cada vez"

**Fase 4 - Fix:**
Cambiar `[manager]` a propiedades especificas como `[manager.resetForm]`:

```typescript
// ANTES (causa bucle infinito)
const handleOpenCreateModal = useCallback(() => {
  manager.resetForm();
  setFormMode('create');
  setIsFormModalOpen(true);
}, [manager]);

// DESPUES (corregido)
const handleOpenCreateModal = useCallback(() => {
  manager.resetForm();
  setFormMode('create');
  setIsFormModalOpen(true);
}, [manager.resetForm]);
```

**Resultado:** 4 componentes corregidos, UI fluida.

## Referencia Rapida

| Fase | Actividades Clave | Criterio de Exito |
|------|-------------------|-------------------|
| **1. Causa Raiz** | Lee errores, reproduce, verifica cambios, recopila evidencia | Entender QUE y POR QUE |
| **2. Patron** | Encuentra ejemplos funcionando, compara | Identificar diferencias |
| **3. Hipotesis** | Forma teoria, prueba minimamente | Confirmada o nueva hipotesis |
| **4. Implementacion** | Crea test, arregla, verifica | Bug resuelto, tests pasan |

## Impacto en el Mundo Real

De sesiones de debugging en este proyecto:
- Enfoque sistematico: 15-30 minutos para fix
- Enfoque de fixes aleatorios: 2-3 horas de vueltas
- Tasa de fix a la primera: 95% vs 40%
- Nuevos bugs introducidos: Casi cero vs comun
