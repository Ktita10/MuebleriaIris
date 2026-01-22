# MuebleriaIris - Agent Skills

## Descripción del Proyecto

MuebleriaIris es un sistema ERP completo para gestión de mueblería con:

- **Frontend**: Astro 5.16.4 + React 19.2.1 + TailwindCSS 4.1.17
- **Backend**: Flask + SQLAlchemy + PostgreSQL
- **Arquitectura**: API REST + Frontend SPA

## Tech Stack

| Componente | Tecnologías |
|------------|-------------|
| Frontend | Astro, React 19, TailwindCSS 4, TypeScript |
| Backend | Flask, SQLAlchemy, PostgreSQL, Python 3.9+ |
| Testing | pytest, Playwright, React Testing Library |

---

## Available Skills

### Frontend Skills
| Skill | Description | URL |
|-------|-------------|-----|
| `muebleria-ui` | Astro + React + TailwindCSS patterns | [SKILL.md](agents/muebleria-ui/SKILL.md) |
| `muebleria-astro` | Astro 5 routing, Islands, SSR patterns | [SKILL.md](agents/muebleria-astro/SKILL.md) |
| `muebleria-react` | React 19 hooks and components | [SKILL.md](agents/muebleria-react/SKILL.md) |
| `muebleria-mobile` | Responsive design patterns | [SKILL.md](agents/muebleria-mobile/SKILL.md) |
| `muebleria-forms` | react-hook-form + Zod validation | [SKILL.md](agents/muebleria-forms/SKILL.md) |
| `muebleria-test-ui` | Frontend testing (Playwright, RTL) | [SKILL.md](agents/muebleria-test-ui/SKILL.md) |

### Backend Skills
| Skill | Description | URL |
|-------|-------------|-----|
| `muebleria-api` | Flask REST API patterns | [SKILL.md](agents/muebleria-api/SKILL.md) |
| `muebleria-python` | Python development standards | [SKILL.md](agents/muebleria-python/SKILL.md) |
| `muebleria-security` | JWT auth, RBAC, password hashing | [SKILL.md](agents/muebleria-security/SKILL.md) |
| `muebleria-errors` | Error handling and logging | [SKILL.md](agents/muebleria-errors/SKILL.md) |
| `muebleria-integrations` | External APIs (MercadoPago, emails) | [SKILL.md](agents/muebleria-integrations/SKILL.md) |
| `muebleria-test-api` | Backend testing (pytest) | [SKILL.md](agents/muebleria-test-api/SKILL.md) |

### Database Skills
| Skill | Description | URL |
|-------|-------------|-----|
| `muebleria-db` | PostgreSQL schema and migrations | [SKILL.md](agents/muebleria-db/SKILL.md) |

### Documentation & Workflow
| Skill | Description | URL |
|-------|-------------|-----|
| `muebleria-docs` | Documentation standards | [SKILL.md](agents/muebleria-docs/SKILL.md) |
| `pull-request` | Git workflow and PR conventions | [SKILL.md](agents/pull-request/SKILL.md) |

### Meta Skills
| Skill | Description | URL |
|-------|-------------|-----|
| `skills-creator` | Create new agent skills | [SKILL.md](agents/skills-creator/SKILL.md) |
| `skills-sync` | Sync skill metadata to AGENTS.md | [SKILL.md](agents/skills-sync/SKILL.md) |

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating/modifying UI components | `muebleria-ui` |
| Working on Astro layouts and pages | `muebleria-astro` |
| Using Astro Islands architecture | `muebleria-astro` |
| Implementing SSR/SSG routes | `muebleria-astro` |
| Dynamic routing with Astro | `muebleria-astro` |
| Styling with TailwindCSS v4 | `muebleria-ui` |
| Creating React components | `muebleria-react` |
| Using React hooks | `muebleria-react` |
| Building forms with validation | `muebleria-forms` |
| Creating forms with react-hook-form | `muebleria-forms` |
| Implementing Zod schemas | `muebleria-forms` |
| Creating mobile layouts | `muebleria-mobile` |
| Implementing responsive design | `muebleria-mobile` |
| Working on mobile-first components | `muebleria-mobile` |
| Creating/modifying API endpoints | `muebleria-api` |
| Working with database models | `muebleria-api` |
| Implementing business logic | `muebleria-api` |
| Implementing authentication | `muebleria-security` |
| Setting up JWT tokens | `muebleria-security` |
| Implementing authorization/RBAC | `muebleria-security` |
| Password hashing and validation | `muebleria-security` |
| Implementing error handling | `muebleria-errors` |
| Setting up logging | `muebleria-errors` |
| Creating error boundaries | `muebleria-errors` |
| Integrating MercadoPago | `muebleria-integrations` |
| Sending emails | `muebleria-integrations` |
| Working with external APIs | `muebleria-integrations` |
| Writing Python backend code | `muebleria-python` |
| Managing Python dependencies | `muebleria-python` |
| Setting up virtual environments | `muebleria-python` |
| Modifying database schema | `muebleria-db` |
| Creating migrations | `muebleria-db` |
| Writing SQL queries | `muebleria-db` |
| Writing frontend tests | `muebleria-test-ui` |
| Testing React components | `muebleria-test-ui` |
| E2E testing with Playwright | `muebleria-test-ui` |
| Writing API tests | `muebleria-test-api` |
| Testing Flask endpoints | `muebleria-test-api` |
| Database testing | `muebleria-test-api` |
| Writing documentation | `muebleria-docs` |
| Updating README files | `muebleria-docs` |
| Documenting API endpoints | `muebleria-docs` |
| Creating pull requests | `pull-request` |
| Reviewing code changes | `pull-request` |
| Managing Git branches | `pull-request` |

---

## Project Structure

```
MuebleriaIris/
├── src/                    # Frontend (Astro + React)
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   ├── data/          # Data display components
│   │   ├── desktop/       # Desktop-specific layouts
│   │   └── mobile/        # Mobile-specific layouts
│   ├── layouts/
│   ├── pages/             # File-based routing
│   └── styles/
├── backend/               # API (Flask)
│   ├── app/
│   │   ├── __init__.py   # Flask factory
│   │   ├── models.py     # SQLAlchemy models
│   │   └── routes.py     # API endpoints
│   ├── config.py         # Configuration
│   └── run.py            # Entry point
├── agents/               # AI agent skills
└── tests/                # Test suites
```

---

## Development Workflow

### Frontend Development
```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # Build for production
npm run preview      # Preview build
```

### Backend Development
```bash
python backend/run.py           # Start API server
pip install -r requirements.txt # Install dependencies
```

### Testing
```bash
npm test                        # Frontend tests
pytest backend/tests/           # Backend tests
npx playwright test             # E2E tests
```

---

## Critical Rules

### ALWAYS:
- Use TypeScript for all React components
- Validate API inputs before database operations
- Handle errors with try/except in Python
- Use TailwindCSS for styling (no inline styles)
- Write tests for new features
- Follow conventional commit format

### NEVER:
- Hardcode credentials or secrets
- Expose stack traces to clients
- Skip input validation
- Mix Astro and React patterns incorrectly
- Use useMemo/useCallback in React 19 (compiler handles it)

---

## Getting Started

1. **Setup Skills**: `./agents/setup.sh`
2. **Install Dependencies**: `npm install && pip install -r backend/requirements.txt`
3. **Configure Database**: Create PostgreSQL database `muebleria_erp`
4. **Start Development**: `npm run dev` + `python backend/run.py`
5. **Read Documentation**: See `GUIA-SUBAGENTES.md` for complete guide

---

**For more information**, see:
- [Complete Guide](GUIA-SUBAGENTES.md) - Full system documentation
- [Quick Start](QUICK-START.md) - 5-minute setup guide
- [Summary](RESUMEN-CONFIGURACION.md) - Executive summary
