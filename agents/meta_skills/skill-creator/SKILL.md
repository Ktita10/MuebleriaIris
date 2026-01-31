---
name: skill-creator
description: >
  Creates new AI agent skills following the Agent Skills spec.
  Trigger: When user asks to create a new skill, add agent instructions, or document patterns for AI.
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "1.0"
  scope: [root]
  auto_invoke: "Creating new skills"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# skill-creator

## Cuándo crear una habilidad

Crea una habilidad cuando:

- Se usa un patrón repetidamente y la IA necesita guía
- Las convenciones específicas del proyecto difieren de las mejores prácticas genéricas
- Flujos de trabajo complejos necesitan instrucciones paso a paso
- Árboles de decisión ayudan a la IA a elegir el enfoque correcto

**No crees una habilidad cuando:**

- La documentación ya existe (crea una referencia en su lugar)
- El patrón es trivial o autoexplicativo
- Es una tarea de una sola vez

---

## Estructura de la Habilidad

```
agents/{nombre-skill}/
├── SKILL.md              # Requerido - archivo principal de la habilidad
├── assets/               # Opcional - plantillas, esquemas, ejemplos
│   ├── template.py
│   └── schema.json
└── references/           # Opcional - enlaces a documentación local
    └── docs.md           # Apunta a docs/developer-guide/*.mdx
```

---

## Plantilla SKILL.md

````markdown
---
name: { skill-name }
description: >
  {One-line description of what this skill does}.
  Trigger: {When the AI should load this skill}.
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "1.0"
---

## When to Use

{Bullet points of when to use this skill}

## Critical Patterns

{The most important rules - what AI MUST know}

## Code Examples

{Minimal, focused examples}

## Commands

```bash
{Common commands}
```
````

## Recursos

- **Templates**: Ver [assets/](assets/) para {description}
- **Documentation**: Ver [references/](references/) para docs locales

```

---

## Convenciones de Nombramiento

| Tipo | Patrón | Ejemplos |
|------|--------|----------|
| Habilidad genérica | `{tecnología}` | `pytest`, `playwright`, `typescript` |
| Específico de Prowler | `prowler-{componente}` | `prowler-api`, `prowler-ui`, `prowler-sdk-check` |
| Habilidad de testing | `prowler-test-{componente}` | `prowler-test-sdk`, `prowler-test-api` |
| Habilidad de flujo | `{acción}-{objetivo}` | `skill-creator`, `jira-task` |

---

## Decisión: assets/ vs references/

```

¿Necesitas plantillas de código? → assets/
¿Necesitas esquemas JSON? → assets/
¿Necesitas configs de ejemplo? → assets/
¿Enlazar a docs existentes? → references/
¿Enlazar a guías externas? → references/ (con ruta local)

```

**Regla Clave**: `references/` debe apuntar a archivos LOCALES (`docs/developer-guide/*.mdx`), no URLs web.

---

## Decisión: Específico de Prowler vs Genérico

```

¿Los patrones aplican a CUALQUIER proyecto? → Habilidad genérica (ej. pytest, typescript)
¿Los patrones son específicos de Prowler? → habilidad prowler-{nombre}
¿Habilidad genérica necesita info de Prowler? → Agregar references/ apuntando a docs de Prowler

````

---

## Campos Frontmatter

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `name` | Sí | Identificador de habilidad (minúsculas, guiones) |
| `description` | Sí | Qué + Trigger en un bloque |
| `license` | Sí | Siempre `Apache-2.0` para Prowler |
| `metadata.author` | Sí | `prowler-cloud` |
| `metadata.version` | Sí | Versión semántica como string |

---

## Guías de Contenido

### SÍ
- Comenzar con los patrones más críticos
- Usar tablas para árboles de decisión
- Mantener ejemplos de código mínimos y enfocados
- Incluir sección de Comandos con comandos para copiar y pegar

### NO
- Agregar sección de Palabras Clave (el agente busca en frontmatter, no cuerpo)
- Duplicar contenido de docs existentes (referenciar en su lugar)
- Incluir explicaciones largas (enlazar a docs)
- Agregar secciones de solución de problemas (mantener enfocado)
- Usar URLs web en referencias (usar rutas locales)

---

## Registrando la Habilidad

Después de crear la habilidad, agrégala a `AGENTS.md`:

```markdown
| `{nombre-skill}` | {Descripción} | [SKILL.md](agents/{nombre-skill}/SKILL.md) |
````

---

## Checklist Antes de Crear

- [ ] La habilidad no existe ya (revisar `agents/`)
- [ ] El patrón es reutilizable (no de una sola vez)
- [ ] El nombre sigue las convenciones
- [ ] Frontmatter está completo (descripción incluye palabras clave de trigger)
- [ ] Patrones críticos son claros
- [ ] Ejemplos de código son mínimos
- [ ] Existe sección de Comandos
- [ ] Agregado a AGENTS.md

## Recursos

- **Plantillas**: Ver [assets/](assets/) para plantilla SKILL.md
