---
name: skill-sync
description: >
  Syncs skill metadata to AGENTS.md Auto-invoke sections.
  Trigger: When updating skill metadata (metadata.scope/metadata.auto_invoke), regenerating Auto-invoke tables, or running ./agents/skill-sync/assets/sync.sh (including --dry-run/--scope).
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "After creating/modifying a skill"
    - "Regenerate AGENTS.md Auto-invoke tables (sync.sh)"
    - "Troubleshoot why a skill is missing from AGENTS.md auto-invoke"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# skill-sync

## Propósito

Mantiene las secciones Auto-invoke de AGENTS.md sincronizadas con los metadatos de las
habilidades. Cuando crees o modifiques una habilidad, ejecuta el script de sincronización
para actualizar automáticamente todos los archivos AGENTS.md afectados.

## Metadatos Requeridos de Habilidad

Cada habilidad que deba aparecer en secciones Auto-invoke necesita estos campos en `metadata`.

`auto_invoke` puede ser una sola cadena **o** una lista de acciones:

```yaml
metadata:
  author: prowler-cloud
  version: "1.0"
  scope: [ui] # Cuál AGENTS.md: ui, api, sdk, root

  # Opción A: acción única
  auto_invoke: "Creating/modifying components"

  # Opción B: múltiples acciones
  # auto_invoke:
  #   - "Creating/modifying components"
  #   - "Refactoring component folder placement"
```

### Valores de Scope

| Scope        | Actualiza               |
| ------------ | ----------------------- |
| `root`       | `AGENTS.md` (raíz repo) |
| `ui`         | `ui/AGENTS.md`          |
| `api`        | `api/AGENTS.md`         |
| `sdk`        | `prowler/AGENTS.md`     |
| `mcp_server` | `mcp_server/AGENTS.md`  |

Las habilidades pueden tener múltiples scopes: `scope: [ui, api]`

---

## Uso

### Después de Crear/Modificar una Habilidad

```bash
./agents/skill-sync/assets/sync.sh
```

### Qué Hace

1. Lee todos los archivos `agents/*/SKILL.md`
2. Extrae `metadata.scope` y `metadata.auto_invoke`
3. Genera tablas Auto-invoke para cada AGENTS.md
4. Actualiza la sección `### Auto-invoke Skills` en cada archivo

---

## Ejemplo

Dados estos metadatos de habilidad:

```yaml
# agents/prowler-ui/SKILL.md
metadata:
  author: prowler-cloud
  version: "1.0"
  scope: [ui]
  auto_invoke: "Creating/modifying React components"
```

El script de sincronización genera en `ui/AGENTS.md`:

```markdown
### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                              | Skill        |
| ----------------------------------- | ------------ |
| Creating/modifying React components | `prowler-ui` |
```

---

## Comandos

```bash
# Sincronizar todos los archivos AGENTS.md
./agents/skill-sync/assets/sync.sh

# Ejecución de prueba (mostrar qué cambiaría)
./agents/skill-sync/assets/sync.sh --dry-run

# Sincronizar solo scope específico
./agents/skill-sync/assets/sync.sh --scope ui
```

---

## Checklist Después de Modificar Habilidades

- [ ] Agregado `metadata.scope` a habilidad nueva/modificada
- [ ] Agregado `metadata.auto_invoke` con descripción de acción
- [ ] Ejecutado `./agents/skill-sync/assets/sync.sh`
- [ ] Verificado que los archivos AGENTS.md se actualizaron correctamente
