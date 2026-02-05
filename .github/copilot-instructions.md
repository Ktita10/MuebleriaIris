---
applyTo: '**'
---

# MuebleriaIris - Instrucciones para Agentes de IA

Sistema ERP de mueblería con frontend Astro/React y backend Flask.

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | Astro + React + TailwindCSS | 5 / 19 / 4 |
| Backend | Flask + SQLAlchemy + PostgreSQL | 3.x / 2.x |
| Testing | Playwright + pytest + RTL | Latest |
| Lenguajes | TypeScript + Python | 5.x / 3.9+ |

## Skills Disponibles

Las skills están en `github/skills/`. Úsalas según el contexto:

### Frontend

| Skill | Cuándo Usar |
|-------|-------------|
| [astro-islands](../github/skills/astro-islands/SKILL.md) | Componentes Astro, Islands Architecture, directivas client:* |
| [tailwind-patterns](../github/skills/tailwind-patterns/SKILL.md) | Estilos, responsive design, clases utilitarias |
| [react-best-practices](../github/skills/react-best-practices/SKILL.md) | Componentes React, optimización, hooks |
| [frontend-design](../github/skills/frontend-design/SKILL.md) | Diseño creativo, evitar "AI slop" |

### Backend

| Skill | Cuándo Usar |
|-------|-------------|
| [flask-api](../github/skills/flask-api/SKILL.md) | Rutas, blueprints, API REST |
| [python-backend](../github/skills/python-backend/SKILL.md) | Código Python, type hints, patrones |
| [auth-security](../github/skills/auth-security/SKILL.md) | JWT, autenticación, protección de rutas |
| [sqlalchemy-database](../github/skills/sqlalchemy-database/SKILL.md) | Modelos, consultas, migraciones |

### Desarrollo General

| Skill | Cuándo Usar |
|-------|-------------|
| [refactor](../github/skills/refactor/SKILL.md) | Mejorar código existente sin cambiar comportamiento |
| [git-commit](../github/skills/git-commit/SKILL.md) | Commits con Conventional Commits |
| [webapp-testing](../github/skills/webapp-testing/SKILL.md) | Testing E2E con Playwright |
| [web-designer-reviewer](../github/skills/web-designer-reviewer/SKILL.md) | Revisión visual de UI |
| [web-design-guidelines](../github/skills/web-design-guidelines/SKILL.md) | Auditoría de UI según Vercel guidelines |

### Meta-Skills

| Skill | Cuándo Usar |
|-------|-------------|
| [skill-creator](../github/skills/skill-creator/SKILL.md) | Guía para crear nuevas skills |
| [Skill-template](../github/skills/Skill-template/SKILL.md) | Template para nuevas skills |

## Estructura del Proyecto

```
MuebleriaIris/
├── src/                          # Frontend Astro/React
│   ├── components/
│   │   ├── admin/                # Managers de administración
│   │   ├── auth/                 # Login, Register, UserMenu
│   │   ├── cart/                 # Carrito de compras
│   │   ├── catalog/              # Catálogo de productos
│   │   ├── home/                 # Componentes de landing
│   │   └── ui/                   # Componentes reutilizables
│   ├── layouts/
│   ├── pages/
│   └── lib/
├── backend/
│   └── app/
│       ├── routes/               # API endpoints (Flask blueprints)
│       ├── services/             # Lógica de negocio
│       ├── utils/                # Helpers y validadores
│       ├── models.py             # Modelos SQLAlchemy
│       └── security.py           # JWT y autenticación
└── github/skills/                # Skills para agentes IA
```

## Convenciones

### Código

- **TypeScript**: Strict mode, interfaces sobre types
- **Python**: Type hints obligatorios, Black formatter
- **Componentes**: PascalCase, un componente por archivo
- **Hooks**: Prefijo `use`, en `src/lib/hooks/`
- **API**: RESTful, respuestas JSON consistentes

### Commits

Usar Conventional Commits (ver skill `git-commit`):
```
feat(catalog): add product filtering
fix(cart): resolve quantity update bug
refactor(admin): extract table component
```

### Testing

- Frontend: Playwright para E2E, RTL para componentes
- Backend: pytest con fixtures, coverage > 80%

## Flujo de Trabajo Recomendado

1. **Antes de codificar**: Consulta la skill relevante
2. **Durante**: Aplica los patrones de la skill
3. **Después**: Usa `refactor` skill si es necesario
4. **Commit**: Usa `git-commit` skill

## Notas Importantes

- El frontend usa Islands Architecture (Astro) - no todo necesita JavaScript
- React se hidrata solo donde es necesario (directivas `client:*`)
- El backend maneja autenticación JWT - siempre verificar tokens
- Los modelos usan soft delete (columna `eliminado`)
