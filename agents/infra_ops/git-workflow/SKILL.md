---
name: pull-request
description: >
  Pull request conventions and workflow for MuebleriaIris.
  Trigger: When creating PRs, reviewing code, or managing Git workflow.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Creating pull requests"
    - "Reviewing code changes"
    - "Managing Git branches"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# pull-request

## Cuándo usar

Usa esta habilidad cuando:

- Crees pull requests
- Revises cambios de código
- Gestiones ramas de Git
- Escribas mensajes de commit
- Fusiones ramas

---

## Flujo de trabajo Git

```
1. Crear rama de característica desde main
2. Hacer cambios + commit
3. Push al remoto
4. Crear pull request
5. Revisión de código
6. Fusionar a main
```

---

## Patrones Críticos

### Patrón 1: Nombramiento de Ramas

```bash
# Ramas de características
feature/add-product-filter
feature/inventory-alerts

# Corrección de errores
fix/product-validation
fix/order-stock-deduction

# Mejoras
improve/api-error-handling
improve/ui-responsiveness

# Documentación
docs/api-endpoints
docs/setup-guide
```

### Patrón 2: Mensajes de Commit

```bash
# Formato: <tipo>(<ámbito>): <descripción>

# Buenos commits
feat(products): add image upload endpoint
fix(orders): prevent negative stock
docs(readme): update setup instructions
style(ui): improve button spacing
refactor(api): extract validation logic
test(orders): add stock deduction tests

# Malos commits
update stuff
fix bug
changes
wip
```

### Patrón 3: Plantilla de PR

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring
- [ ] Testing

## Changes Made

- Added product image upload
- Updated validation logic
- Fixed stock deduction bug

## Testing

- [ ] Tested locally
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Tested on mobile

## Screenshots (if UI changes)

![Screenshot](url)

## Checklist

- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No console errors
```

---

## Comandos Git

```bash
# Crear y cambiar a nueva rama
git checkout -b feature/my-feature

# Staging de cambios
git add .

# Commit con mensaje
git commit -m "feat(products): add filter by category"

# Push al remoto
git push origin feature/my-feature

# Crear PR (usando GitHub CLI)
gh pr create --title "Add product filter" --body "..."

# Actualizar rama con main
git checkout main
git pull origin main
git checkout feature/my-feature
git merge main

# Alternativa: rebase
git rebase main

# Squash commits antes de merge
git rebase -i HEAD~3
```

---

## Checklist de Revisión de Código

### Para Revisores

- [ ] El código sigue las convenciones del proyecto
- [ ] Sin credenciales hardcodeadas
- [ ] Manejo de errores presente
- [ ] Tests cubren nueva funcionalidad
- [ ] Sin cambios que rompen compatibilidad (breaking changes)
- [ ] Documentación actualizada
- [ ] Consideraciones de rendimiento
- [ ] Vulnerabilidades de seguridad

### Comentarios Comunes de Revisión

```markdown
# Sugerir mejora
**Suggestion:** Extract this logic into a separate function

# Solicitar cambio
**Change needed:** Add error handling for this API call

# Preguntar
**Question:** Why did we choose this approach?

# Aprobar con detalle menor
**LGTM** (Looks Good To Me) with minor nit: rename variable

# Solicitar tests
**Tests:** Can you add tests for this edge case?
```

---

## Mejores Prácticas de Pull Request

### SÍ:
- Mantener PRs pequeños y enfocados (< 400 líneas)
- Escribir títulos de PR descriptivos
- Vincular issues relacionados (#123)
- Probar antes de enviar
- Responder a comentarios de revisión
- Squash commits WIP

### NO:
- Mezclar cambios no relacionados
- Enviar código no probado
- Ignorar feedback de revisión
- Force push después de revisión
- Dejar comentarios TODO
- Incluir código de debug

---

## Estrategias de Fusión

```bash
# Squash y merge (preferido para ramas de características)
# Combina todos los commits en uno
git merge --squash feature/my-feature

# Merge regular (para ramas de release)
git merge feature/my-feature

# Rebase y merge (historial limpio)
git rebase main
git checkout main
git merge feature/my-feature
```

---

## Resolviendo Conflictos

```bash
# Cuando ocurren conflictos de fusión
git merge main
# Arreglar conflictos en archivos
git add .
git commit -m "Merge main into feature"
git push

# Usando VS Code
# 1. Abrir archivo en conflicto
# 2. Elegir: Accept Current | Accept Incoming | Accept Both
# 3. Guardar y commitear
```

---

## Comandos

```bash
# Crear rama
git checkout -b feature/name

# Commit
git add .
git commit -m "feat: description"

# Push
git push origin feature/name

# Crear PR (GitHub CLI)
gh pr create

# Ver PRs
gh pr list

# Checkout PR localmente
gh pr checkout 123

# Merge PR
gh pr merge 123 --squash
```

---

## Checklist de QA

- [ ] Nombre de rama sigue convención
- [ ] Commits son descriptivos
- [ ] PR tiene descripción clara
- [ ] Tests pasan (npm test, pytest)
- [ ] Sin conflictos de fusión
- [ ] Código auto-revisado
- [ ] Documentación actualizada
- [ ] Capturas de pantalla para cambios de UI

---

## Recursos

- **Flujo GitHub**: https://guides.github.com/introduction/flow/
- **Conventional Commits**: https://www.conventionalcommits.org
