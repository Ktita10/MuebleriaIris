# MuebleriaIris - GitHub Copilot Instructions

Complete ERP system for furniture store management with AI agent skills support.

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| Frontend  | Astro 5, React 19, TailwindCSS 4, TypeScript |
| Backend   | Flask, SQLAlchemy, PostgreSQL, Python 3.9+ |
| Testing   | pytest, Playwright, React Testing Library |

---

## Agent Skills

Skills are available in `.github/skills/` directory. Each skill contains specialized patterns and instructions.

### Available Skills

| Skill | Description |
|-------|-------------|
| `muebleria-ui` | Astro + React + TailwindCSS patterns |
| `muebleria-astro` | Astro 5 routing, Islands, SSR patterns |
| `muebleria-react` | React 19 hooks and components |
| `muebleria-forms` | react-hook-form + Zod validation |
| `muebleria-mobile` | Responsive design patterns |
| `muebleria-api` | Flask REST API patterns |
| `muebleria-python` | Python development standards |
| `muebleria-security` | JWT auth, RBAC, password hashing |
| `muebleria-errors` | Error handling and logging |
| `muebleria-integrations` | External APIs (MercadoPago, emails) |
| `muebleria-db` | PostgreSQL schema and migrations |
| `muebleria-test-ui` | Frontend testing (Playwright, RTL) |
| `muebleria-test-api` | Backend testing (pytest) |
| `muebleria-docs` | Documentation standards |
| `muebleria-deployment` | Docker, CI/CD, deployment |
| `pull-request` | Git workflow and PR conventions |

---

## When to Use Skills

| Action | Skill |
|--------|-------|
| Creating UI components | `muebleria-ui` |
| Astro pages and layouts | `muebleria-astro` |
| React components | `muebleria-react` |
| Forms with validation | `muebleria-forms` |
| Responsive design | `muebleria-mobile` |
| API endpoints | `muebleria-api` |
| Authentication | `muebleria-security` |
| Database models | `muebleria-db` |
| Error handling | `muebleria-errors` |
| External integrations | `muebleria-integrations` |
| Frontend tests | `muebleria-test-ui` |
| Backend tests | `muebleria-test-api` |
| Documentation | `muebleria-docs` |
| Pull requests | `pull-request` |

---

## Project Structure

```
MuebleriaIris/
├── src/                    # Frontend (Astro + React)
│   ├── components/         # UI and feature components
│   ├── pages/              # File-based routing
│   ├── layouts/            # Page layouts
│   ├── stores/             # Global state
│   └── lib/                # Utilities
│
├── backend/                # API Server (Flask)
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── models.py       # Database models
│   └── config.py
│
├── agents/                 # AI Agent Skills (source)
├── .github/skills/         # GitHub Copilot (symlinks)
├── docs/                   # Documentation
└── public/                 # Static assets
```

---

## Critical Rules

### ALWAYS:
- Use TypeScript for all React components
- Validate API inputs before database operations
- Handle errors with try/except in Python
- Use TailwindCSS for styling (no inline styles)
- Follow conventional commit format

### NEVER:
- Hardcode credentials or secrets
- Expose stack traces to clients
- Skip input validation
- Use useMemo/useCallback in React 19 (compiler handles it)

---

## Commands

```bash
# Frontend
npm run dev              # Start dev server (localhost:4321)
npm run build            # Build for production

# Backend
python backend/run.py    # Start API server (localhost:5000)

# Tests
npm test                 # Frontend tests
pytest backend/tests/    # Backend tests
```

---

## Documentation

See [AGENTS.md](../AGENTS.md) for complete skills documentation.
See [docs/](../docs/) for guides and troubleshooting.
