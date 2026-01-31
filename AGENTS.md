# MuebleriaIris - Habilidades de Agente

Sistema ERP completo para gestión de mueblería con soporte de habilidades de agentes de IA.

## Stack Tecnológico

| Componente | Tecnologías |
|-----------|-------------|
| Frontend  | Astro 5, React 19, TailwindCSS 4, TypeScript |
| Backend   | Flask, SQLAlchemy, PostgreSQL, Python 3.9+ |
| Testing   | pytest, Playwright, React Testing Library |

---

## Habilidades Disponibles

**Nueva Arquitectura DDD:** Las habilidades están organizadas en categorías siguiendo Clean Architecture.

### 🎨 Frontend & UX (`frontend_ux/`)
| Habilidad | Directorio | Descripción |
|-------|-----------|-------------|
| `muebleria-ui` | [agents/frontend_ux/ui-components](agents/frontend_ux/ui-components/SKILL.md) | Patrones Astro + React + TailwindCSS |
| `muebleria-astro` | [agents/frontend_ux/astro-pages](agents/frontend_ux/astro-pages/SKILL.md) | Enrutamiento Astro 5, Islands, patrones SSR |
| `muebleria-react` | [agents/frontend_ux/react-components](agents/frontend_ux/react-components/SKILL.md) | Hooks y componentes React 19 |
| `muebleria-mobile` | [agents/frontend_ux/responsive-design](agents/frontend_ux/responsive-design/SKILL.md) | Patrones de diseño responsivo |
| `muebleria-forms` | [agents/frontend_ux/forms-validation](agents/frontend_ux/forms-validation/SKILL.md) | Validación con react-hook-form + Zod |

### 🎯 Lógica de Negocio (`domain_core/`)
| Habilidad | Directorio | Descripción |
|-------|-----------|-------------|
| `muebleria-api` | [agents/domain_core/api-backend](agents/domain_core/api-backend/SKILL.md) | Patrones de API REST con Flask |
| `muebleria-db` | [agents/domain_core/database](agents/domain_core/database/SKILL.md) | Esquema PostgreSQL y migraciones |
| `muebleria-security` | [agents/domain_core/auth-security](agents/domain_core/auth-security/SKILL.md) | Auth JWT, RBAC, hashing de contraseñas |
| `muebleria-integrations` | [agents/domain_core/external-integrations](agents/domain_core/external-integrations/SKILL.md) | APIs externas (MercadoPago, emails) |

### 🏗️ Infraestructura & Ops (`infra_ops/`)
| Habilidad | Directorio | Descripción |
|-------|-----------|-------------|
| `muebleria-deployment` | [agents/infra_ops/deployment](agents/infra_ops/deployment/SKILL.md) | Docker, CI/CD, despliegue |
| `pull-request` | [agents/infra_ops/git-workflow](agents/infra_ops/git-workflow/SKILL.md) | Flujo de trabajo Git y convenciones de PR |
| `muebleria-python` | [agents/infra_ops/python-dev](agents/infra_ops/python-dev/SKILL.md) | Estándares de desarrollo Python |
| `muebleria-errors` | [agents/infra_ops/error-handling](agents/infra_ops/error-handling/SKILL.md) | Manejo de errores y logging |
| `muebleria-docs` | [agents/infra_ops/documentation](agents/infra_ops/documentation/SKILL.md) | Estándares de documentación |

### 🧪 Aseguramiento de Calidad (`quality_qa/`)
| Habilidad | Directorio | Descripción |
|-------|-----------|-------------|
| `muebleria-test-api` | [agents/quality_qa/testing-backend](agents/quality_qa/testing-backend/SKILL.md) | Pruebas de backend (pytest) |
| `muebleria-test-ui` | [agents/quality_qa/testing-frontend](agents/quality_qa/testing-frontend/SKILL.md) | Pruebas de frontend (Playwright, RTL) |

### 🤖 Meta-agentes (`meta_skills/`)
| Habilidad | Directorio | Descripción |
|-------|-----------|-------------|
| `skill-creator` | [agents/meta_skills/skill-creator](agents/meta_skills/skill-creator/SKILL.md) | Crear nuevas habilidades de agente |
| `skill-sync` | [agents/meta_skills/skill-sync](agents/meta_skills/skill-sync/SKILL.md) | Sincronizar metadatos de habilidades a AGENTS.md |

---

## Sistema de Cumplimiento de Habilidades

**MuebleriaIris utiliza un sistema obligatorio de invocación de habilidades.**

### Archivos de Cumplimiento

1. **[`.clinerules`](.clinerules)** - Archivo de reglas principal (LEER PRIMERO)
2. **[`.opencode/rules.md`](.opencode/rules.md)** - Detalles técnicos de implementación
3. **[`.opencode/skills-map.json`](.opencode/skills-map.json)** - Mapeo de patrones legible por máquina

### Resumen Rápido de Reglas

**Antes de escribir CUALQUIER código:**
1. DETENTE - No escribas inmediatamente
2. COINCIDE - Verifica el patrón del archivo contra `.clinerules`
3. INVOCA - Llama a la(s) habilidad(es) requerida(s) usando la herramienta Skill
4. LEE - Lee completamente las guías de la habilidad
5. APLICA - Implementa siguiendo los patrones de la habilidad
6. VERIFICA - Confirma que la implementación coincide con las habilidades

---

## Compatibilidad con GitHub Copilot

Las habilidades están disponibles para GitHub Copilot a través de enlaces simbólicos en `.github/skills/`:

```
.github/skills/
├── muebleria-ui      → agents/frontend_ux/ui-components/
├── muebleria-api     → agents/domain_core/api-backend/
├── muebleria-react   → agents/frontend_ux/react-components/
└── ...
```

Copilot descubre y utiliza automáticamente las habilidades basándose en sus descripciones.

---

## Habilidades de Auto-invocación

Al realizar estas acciones, SIEMPRE invoca la habilidad correspondiente PRIMERO:

| Acción | Habilidad |
|--------|-------|
| Crear/modificar componentes UI | `muebleria-ui` |
| Trabajar en layouts y páginas Astro | `muebleria-astro` |
| Usar arquitectura Astro Islands | `muebleria-astro` |
| Implementar rutas SSR/SSG | `muebleria-astro` |
| Estilar con TailwindCSS v4 | `muebleria-ui` |
| Crear componentes React | `muebleria-react` |
| Usar hooks de React | `muebleria-react` |
| Construir formularios con validación | `muebleria-forms` |
| Crear formularios con react-hook-form | `muebleria-forms` |
| Implementar esquemas Zod | `muebleria-forms` |
| Crear layouts móviles | `muebleria-mobile` |
| Implementar diseño responsivo | `muebleria-mobile` |
| Crear/modificar endpoints API | `muebleria-api` |
| Trabajar con modelos de base de datos | `muebleria-api` |
| Implementar lógica de negocio | `muebleria-api` |
| Implementar autenticación | `muebleria-security` |
| Configurar tokens JWT | `muebleria-security` |
| Implementar autorización/RBAC | `muebleria-security` |
| Hashing y validación de contraseñas | `muebleria-security` |
| Implementar manejo de errores | `muebleria-errors` |
| Configurar logging | `muebleria-errors` |
| Integrar MercadoPago | `muebleria-integrations` |
| Enviar correos | `muebleria-integrations` |
| Trabajar con APIs externas | `muebleria-integrations` |
| Desplegar a producción | `muebleria-deployment` |
| Configurar Docker | `muebleria-deployment` |
| Configurar CI/CD | `muebleria-deployment` |
| Escribir código backend Python | `muebleria-python` |
| Gestionar dependencias Python | `muebleria-python` |
| Modificar esquema de base de datos | `muebleria-db` |
| Crear migraciones | `muebleria-db` |
| Escribir consultas SQL | `muebleria-db` |
| Escribir pruebas de frontend | `muebleria-test-ui` |
| Probar componentes React | `muebleria-test-ui` |
| Pruebas E2E con Playwright | `muebleria-test-ui` |
| Escribir pruebas de API | `muebleria-test-api` |
| Probar endpoints Flask | `muebleria-test-api` |
| Escribir documentación | `muebleria-docs` |
| Crear pull requests | `pull-request` |

---

## Estructura del Proyecto

```
MuebleriaIris/
├── core/                   # ✨ Módulo core para agentes
│   ├── __init__.py
│   ├── structure.py        # Escaneo de skills
│   ├── agent_base.py       # Clase base para agentes
│   └── README.md
│
├── src/                    # Frontend (Astro + React)
│   ├── components/         # Componentes UI y de funcionalidad
│   ├── pages/              # Enrutamiento basado en archivos
│   ├── layouts/            # Layouts de página
│   ├── stores/             # Estado global
│   └── lib/                # Utilidades
│
├── backend/                # Servidor API (Flask)
│   ├── app/
│   │   ├── routes/         # Endpoints API
│   │   ├── services/       # Lógica de negocio
│   │   └── models.py       # Modelos de base de datos
│   ├── scripts/            # ✨ Scripts organizados
│   │   ├── seeds/          # Población de datos
│   │   ├── maintenance/    # Mantenimiento
│   │   └── ops/            # Operaciones bash
│   ├── tests/              # Pruebas backend
│   ├── run.py
│   └── config.py
│
├── agents/                 # Habilidades de Agente IA (DDD)
│   ├── infra_ops/          # Infraestructura y operaciones
│   ├── domain_core/        # Lógica de negocio
│   ├── frontend_ux/        # Interfaz de usuario
│   ├── quality_qa/         # Aseguramiento de calidad
│   └── meta_skills/        # Meta-agentes
│
├── .github/skills/         # GitHub Copilot (enlaces simbólicos)
│
├── docs/                   # Documentación
│   ├── guides/
│   ├── ai-agents/
│   └── troubleshooting/
│
└── public/                 # Activos estáticos
```

---

## Flujo de Trabajo de Desarrollo

```bash
# Frontend
npm run dev              # Iniciar servidor desarrollo (localhost:4321)
npm run build            # Construir para producción
npm test                 # Ejecutar pruebas frontend

# Backend
python backend/run.py    # Iniciar servidor API (localhost:5000)
pytest backend/tests/    # Ejecutar pruebas backend

# Pruebas E2E
npx playwright test      # Ejecutar pruebas E2E
```

---

## Reglas Críticas

### SIEMPRE:
- Usar TypeScript para todos los componentes React
- Validar entradas de API antes de operaciones de base de datos
- Manejar errores con try/except en Python
- Usar TailwindCSS para estilos (no estilos en línea)
- Seguir el formato de commit convencional

### NUNCA:
- Hardcodear credenciales o secretos
- Exponer stack traces a clientes
- Omitir validación de entradas
- Usar useMemo/useCallback en React 19 (el compilador lo maneja)

---

## Comenzando

1. **Configurar Habilidades**: `./agents/setup.sh`
2. **Instalar Dependencias**: `npm install && pip install -r backend/requirements.txt`
3. **Configurar Base de Datos**: Crear base de datos PostgreSQL `muebleria_erp`
4. **Iniciar Desarrollo**: `npm run dev` + `python backend/run.py`
5. **Leer Documentación**: Ver [docs/guides/01-quick-start.md](docs/guides/01-quick-start.md)

---

## Documentación

- [Inicio Rápido](docs/guides/01-quick-start.md)
- [Instalación](docs/guides/02-installation.md)
- [Configuración](docs/guides/03-configuration.md)
- [Introducción a Agentes IA](docs/ai-agents/00-introduction.md)
- [Referencia de Habilidades](docs/ai-agents/01-skills-reference.md)