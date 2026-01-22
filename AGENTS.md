# MuebleriaIris - Agent Skills

Complete ERP system for furniture store management with AI agent skills support.

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| Frontend  | Astro 5, React 19, TailwindCSS 4, TypeScript |
| Backend   | Flask, SQLAlchemy, PostgreSQL, Python 3.9+ |
| Testing   | pytest, Playwright, React Testing Library |

---

## Available Skills

### Frontend Skills
| Skill | Directory | Description |
|-------|-----------|-------------|
| `muebleria-ui` | [agents/ui-components](agents/ui-components/SKILL.md) | Astro + React + TailwindCSS patterns |
| `muebleria-astro` | [agents/astro-pages](agents/astro-pages/SKILL.md) | Astro 5 routing, Islands, SSR patterns |
| `muebleria-react` | [agents/react-components](agents/react-components/SKILL.md) | React 19 hooks and components |
| `muebleria-mobile` | [agents/responsive-design](agents/responsive-design/SKILL.md) | Responsive design patterns |
| `muebleria-forms` | [agents/forms-validation](agents/forms-validation/SKILL.md) | react-hook-form + Zod validation |
| `muebleria-test-ui` | [agents/testing-frontend](agents/testing-frontend/SKILL.md) | Frontend testing (Playwright, RTL) |

### Backend Skills
| Skill | Directory | Description |
|-------|-----------|-------------|
| `muebleria-api` | [agents/api-backend](agents/api-backend/SKILL.md) | Flask REST API patterns |
| `muebleria-python` | [agents/python-dev](agents/python-dev/SKILL.md) | Python development standards |
| `muebleria-security` | [agents/auth-security](agents/auth-security/SKILL.md) | JWT auth, RBAC, password hashing |
| `muebleria-errors` | [agents/error-handling](agents/error-handling/SKILL.md) | Error handling and logging |
| `muebleria-integrations` | [agents/external-integrations](agents/external-integrations/SKILL.md) | External APIs (MercadoPago, emails) |
| `muebleria-test-api` | [agents/testing-backend](agents/testing-backend/SKILL.md) | Backend testing (pytest) |

### Database Skills
| Skill | Directory | Description |
|-------|-----------|-------------|
| `muebleria-db` | [agents/database](agents/database/SKILL.md) | PostgreSQL schema and migrations |

### Documentation & Workflow
| Skill | Directory | Description |
|-------|-----------|-------------|
| `muebleria-docs` | [agents/documentation](agents/documentation/SKILL.md) | Documentation standards |
| `pull-request` | [agents/git-workflow](agents/git-workflow/SKILL.md) | Git workflow and PR conventions |
| `muebleria-deployment` | [agents/deployment](agents/deployment/SKILL.md) | Docker, CI/CD, deployment |

### Meta Skills
| Skill | Directory | Description |
|-------|-----------|-------------|
| `skill-creator` | [agents/skill-creator](agents/skill-creator/SKILL.md) | Create new agent skills |
| `skill-sync` | [agents/skill-sync](agents/skill-sync/SKILL.md) | Sync skill metadata to AGENTS.md |

---

## Skills Enforcement System

**MuebleriaIris uses a mandatory skills invocation system.**

### Enforcement Files

1. **[`.clinerules`](.clinerules)** - Primary rules file (READ FIRST)
2. **[`.opencode/rules.md`](.opencode/rules.md)** - Technical implementation details
3. **[`.opencode/skills-map.json`](.opencode/skills-map.json)** - Machine-readable pattern mapping

### Quick Rule Summary

**Before writing ANY code:**
1. STOP - Don't write immediately
2. MATCH - Check file pattern against `.clinerules`
3. INVOKE - Call required skill(s) using Skill tool
4. READ - Fully read skill guidelines
5. APPLY - Implement following skill patterns
6. VERIFY - Confirm implementation matches skills

---

## GitHub Copilot Compatibility

Skills are available to GitHub Copilot via symlinks in `.github/skills/`:

```
.github/skills/
├── muebleria-ui      → agents/ui-components/
├── muebleria-api     → agents/api-backend/
├── muebleria-react   → agents/react-components/
└── ...
```

Copilot automatically discovers and uses skills based on their descriptions.

---

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating/modifying UI components | `muebleria-ui` |
| Working on Astro layouts and pages | `muebleria-astro` |
| Using Astro Islands architecture | `muebleria-astro` |
| Implementing SSR/SSG routes | `muebleria-astro` |
| Styling with TailwindCSS v4 | `muebleria-ui` |
| Creating React components | `muebleria-react` |
| Using React hooks | `muebleria-react` |
| Building forms with validation | `muebleria-forms` |
| Creating forms with react-hook-form | `muebleria-forms` |
| Implementing Zod schemas | `muebleria-forms` |
| Creating mobile layouts | `muebleria-mobile` |
| Implementing responsive design | `muebleria-mobile` |
| Creating/modifying API endpoints | `muebleria-api` |
| Working with database models | `muebleria-api` |
| Implementing business logic | `muebleria-api` |
| Implementing authentication | `muebleria-security` |
| Setting up JWT tokens | `muebleria-security` |
| Implementing authorization/RBAC | `muebleria-security` |
| Password hashing and validation | `muebleria-security` |
| Implementing error handling | `muebleria-errors` |
| Setting up logging | `muebleria-errors` |
| Integrating MercadoPago | `muebleria-integrations` |
| Sending emails | `muebleria-integrations` |
| Working with external APIs | `muebleria-integrations` |
| Deploying to production | `muebleria-deployment` |
| Setting up Docker | `muebleria-deployment` |
| Configuring CI/CD | `muebleria-deployment` |
| Writing Python backend code | `muebleria-python` |
| Managing Python dependencies | `muebleria-python` |
| Modifying database schema | `muebleria-db` |
| Creating migrations | `muebleria-db` |
| Writing SQL queries | `muebleria-db` |
| Writing frontend tests | `muebleria-test-ui` |
| Testing React components | `muebleria-test-ui` |
| E2E testing with Playwright | `muebleria-test-ui` |
| Writing API tests | `muebleria-test-api` |
| Testing Flask endpoints | `muebleria-test-api` |
| Writing documentation | `muebleria-docs` |
| Creating pull requests | `pull-request` |

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
├── agents/                 # AI Agent Skills (descriptive names)
│   ├── ui-components/
│   ├── api-backend/
│   └── ...
│
├── .github/skills/         # GitHub Copilot (symlinks)
│
├── docs/                   # Documentation
│   ├── guides/
│   ├── ai-agents/
│   └── troubleshooting/
│
└── public/                 # Static assets
```

---

## Development Workflow

```bash
# Frontend
npm run dev              # Start dev server (localhost:4321)
npm run build            # Build for production
npm test                 # Run frontend tests

# Backend
python backend/run.py    # Start API server (localhost:5000)
pytest backend/tests/    # Run backend tests

# E2E Tests
npx playwright test      # Run E2E tests
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

## Getting Started

1. **Setup Skills**: `./agents/setup.sh`
2. **Install Dependencies**: `npm install && pip install -r backend/requirements.txt`
3. **Configure Database**: Create PostgreSQL database `muebleria_erp`
4. **Start Development**: `npm run dev` + `python backend/run.py`
5. **Read Documentation**: See [docs/guides/01-quick-start.md](docs/guides/01-quick-start.md)

---

## Documentation

- [Quick Start](docs/guides/01-quick-start.md)
- [Installation](docs/guides/02-installation.md)
- [Configuration](docs/guides/03-configuration.md)
- [AI Agents Introduction](docs/ai-agents/00-introduction.md)
- [Skills Reference](docs/ai-agents/01-skills-reference.md)
