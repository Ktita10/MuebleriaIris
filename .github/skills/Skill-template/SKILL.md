---
name: make-skill-template
description: 'Crea nuevas Agent Skills para GitHub Copilot desde prompts o duplicando esta plantilla. Úsalo cuando te pidan "crear una skill", "hacer una nueva skill", "generar estructura de skill", o al construir capacidades especializadas de IA con recursos integrados. Genera archivos SKILL.md con frontmatter apropiado, estructura de directorios y carpetas opcionales de scripts/referencias/assets.'
---

# Plantilla para Crear Skills

Una meta-skill para crear nuevas Agent Skills. Usa esta skill cuando necesites generar la estructura de una nueva skill, crear un archivo SKILL.md, o ayudar a usuarios a entender la especificación de Agent Skills.

## Cuándo Usar Esta Skill

- El usuario pide "crear una skill", "hacer una nueva skill", o "generar estructura de skill"
- El usuario quiere agregar una capacidad especializada a su configuración de GitHub Copilot
- El usuario necesita ayuda estructurando una skill con recursos integrados
- El usuario quiere duplicar esta plantilla como punto de partida

## Prerrequisitos

- Entender qué debe lograr la skill
- Una descripción clara y rica en palabras clave de las capacidades y triggers
- Conocimiento de cualquier recurso integrado necesario (scripts, referencias, assets, plantillas)

## Crear una Nueva Skill

### Paso 1: Crear el Directorio de la Skill

Crea una nueva carpeta con un nombre en minúsculas separado por guiones:

```
skills/<nombre-de-skill>/
└── SKILL.md          # Requerido
```

### Paso 2: Generar SKILL.md con Frontmatter

Cada skill requiere frontmatter YAML con `name` y `description`:

```yaml
---
name: <nombre-de-skill>
description: '<Qué hace>. Úsalo cuando <triggers específicos, escenarios, palabras clave que los usuarios podrían mencionar>.'
---
```

#### Requisitos de Campos del Frontmatter

| Campo | Requerido | Restricciones |
|-------|-----------|---------------|
| `name` | **Sí** | 1-64 caracteres, solo letras minúsculas/números/guiones, debe coincidir con el nombre de la carpeta |
| `description` | **Sí** | 1-1024 caracteres, debe describir QUÉ hace Y CUÁNDO usarlo |
| `license` | No | Nombre de licencia o referencia a LICENSE.txt integrado |
| `compatibility` | No | 1-500 caracteres, requisitos del entorno si es necesario |
| `metadata` | No | Pares clave-valor para propiedades adicionales |
| `allowed-tools` | No | Lista delimitada por espacios de herramientas pre-aprobadas (experimental) |

#### Mejores Prácticas para la Descripción

**CRÍTICO**: La `description` es el mecanismo PRINCIPAL para el descubrimiento automático de skills. Debe incluir:

1. **QUÉ** hace la skill (capacidades)
2. **CUÁNDO** usarla (triggers, escenarios, tipos de archivo)
3. **Palabras clave** que los usuarios podrían mencionar en sus prompts

**Buen ejemplo:**

```yaml
description: 'Kit de herramientas para probar aplicaciones web locales usando Playwright. Úsalo cuando te pidan verificar funcionalidad frontend, depurar comportamiento de UI, capturar screenshots del navegador, o ver logs de consola del navegador. Soporta Chrome, Firefox y WebKit.'
```

**Mal ejemplo:**

```yaml
description: 'Ayudantes para pruebas web'
```

### Paso 3: Escribir el Cuerpo de la Skill

Después del frontmatter, agrega instrucciones en markdown. Secciones recomendadas:

| Sección | Propósito |
|---------|-----------|
| `# Título` | Resumen breve |
| `## Cuándo Usar Esta Skill` | Refuerza los triggers de la descripción |
| `## Prerrequisitos` | Herramientas requeridas, dependencias |
| `## Flujos de Trabajo Paso a Paso` | Pasos numerados para tareas |
| `## Solución de Problemas` | Problemas comunes y soluciones |
| `## Referencias` | Enlaces a documentación integrada |

### Paso 4: Agregar Directorios Opcionales (Si es Necesario)

| Carpeta | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `scripts/` | Código ejecutable (Python, Bash, JS) | Automatización que realiza operaciones |
| `references/` | Documentación que el agente lee | Referencias de API, esquemas, guías |
| `assets/` | Archivos estáticos usados TAL CUAL | Imágenes, fuentes, plantillas |
| `templates/` | Código inicial que el agente modifica | Estructuras base para extender |

## Ejemplo: Estructura Completa de una Skill

```
mi-skill-increible/
├── SKILL.md                    # Instrucciones requeridas
├── LICENSE.txt                 # Archivo de licencia opcional
├── scripts/
│   └── helper.py               # Automatización ejecutable
├── references/
│   ├── api-reference.md        # Documentación detallada
│   └── examples.md             # Ejemplos de uso
├── assets/
│   └── diagram.png             # Recursos estáticos
└── templates/
    └── starter.ts              # Estructura de código
```

## Inicio Rápido: Duplicar Esta Plantilla

1. Copia la carpeta `make-skill-template/`
2. Renómbrala con el nombre de tu skill (minúsculas, guiones)
3. Actualiza `SKILL.md`:
   - Cambia `name:` para que coincida con el nombre de la carpeta
   - Escribe una `description:` rica en palabras clave
   - Reemplaza el contenido del cuerpo con tus instrucciones
4. Agrega recursos integrados según sea necesario
5. Valida con `npm run skill:validate`

## Lista de Verificación para Validación

- [ ] El nombre de la carpeta está en minúsculas con guiones
- [ ] El campo `name` coincide exactamente con el nombre de la carpeta
- [ ] La `description` tiene entre 10-1024 caracteres
- [ ] La `description` explica QUÉ y CUÁNDO
- [ ] La `description` está envuelta en comillas simples
- [ ] El contenido del cuerpo tiene menos de 500 líneas
- [ ] Los assets integrados pesan menos de 5MB cada uno

## Solución de Problemas

| Problema | Solución |
|----------|----------|
| La skill no se descubre | Mejora la descripción con más palabras clave y triggers |
| La validación falla en el nombre | Asegúrate de usar minúsculas, sin guiones consecutivos, que coincida con la carpeta |
| Descripción muy corta | Agrega capacidades, triggers y palabras clave |
| Assets no se encuentran | Usa rutas relativas desde la raíz de la skill |

## Referencias

- Especificación oficial de Agent Skills: <https://agentskills.io/specification>