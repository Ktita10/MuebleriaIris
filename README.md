# MuebleriaIris

Complete ERP system for furniture store management.

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| Frontend  | Astro 5, React 19, TailwindCSS 4, TypeScript |
| Backend   | Flask, SQLAlchemy, PostgreSQL, Python 3.9+ |
| Testing   | pytest, Playwright, React Testing Library |

## Quick Start

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r backend/requirements.txt

# Start frontend (localhost:4321)
npm run dev

# Start backend (localhost:5000)
python backend/run.py
```

## Project Structure

```
MuebleriaIris/
├── src/                    # Frontend (Astro + React)
│   ├── components/         # UI and feature components
│   ├── pages/              # File-based routing
│   ├── layouts/            # Page layouts
│   ├── stores/             # Global state (nanostores)
│   └── lib/                # Utilities and API client
│
├── backend/                # API Server (Flask)
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helpers and validators
│   │   └── models.py       # SQLAlchemy models
│   └── config.py           # Configuration
│
├── agents/                 # AI Agent Skills
│   ├── ui-components/      # UI patterns
│   ├── api-backend/        # API patterns
│   ├── auth-security/      # Security patterns
│   └── ...                 # See AGENTS.md for full list
│
├── docs/                   # Documentation
│   ├── guides/             # Setup and usage guides
│   ├── ai-agents/          # AI configuration docs
│   └── troubleshooting/    # Problem solving
│
├── .github/skills/         # GitHub Copilot compatibility (symlinks)
│
└── public/                 # Static assets
```

## Commands

| Command | Action |
|:--------|:-------|
| `npm run dev` | Start frontend dev server (localhost:4321) |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run frontend unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `python backend/run.py` | Start API server (localhost:5000) |
| `pytest backend/tests/` | Run backend tests |

## Documentation

- [Quick Start Guide](docs/guides/01-quick-start.md)
- [Full Installation](docs/guides/02-installation.md)
- [Configuration Reference](docs/guides/03-configuration.md)
- [AI Agents Guide](docs/ai-agents/00-introduction.md)

## AI Agents

This project uses an AI Agent Skills system compatible with:
- OpenCode
- GitHub Copilot
- Claude
- Gemini

See [AGENTS.md](AGENTS.md) for complete documentation.

## License

Private project.
