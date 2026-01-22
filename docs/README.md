# MuebleriaIris Documentation

## Quick Navigation

### Guides
| Guide | Description |
|-------|-------------|
| [Quick Start](guides/01-quick-start.md) | Get up and running in 5 minutes |
| [Installation](guides/02-installation.md) | Complete installation instructions |
| [Configuration](guides/03-configuration.md) | Full configuration reference |
| [Backend Setup](guides/04-backend-setup.md) | How to run the backend server |
| [Backend Architecture](guides/05-backend-architecture.md) | API structure and patterns |
| [Backend Summary](guides/06-backend-summary.md) | Backend implementation overview |

### AI Agents
| Document | Description |
|----------|-------------|
| [Introduction](ai-agents/00-introduction.md) | AI agents and skills system overview |
| [Skills Reference](ai-agents/01-skills-reference.md) | Complete skills documentation |
| [Configuration Summary](ai-agents/02-configuration-summary.md) | Quick reference for agent setup |
| [Claude Setup](ai-agents/claude.md) | Claude-specific configuration |
| [Gemini Setup](ai-agents/gemini.md) | Gemini-specific configuration |

### Troubleshooting
| Document | Description |
|----------|-------------|
| [Dependencies](troubleshooting/dependencies.md) | Missing dependencies and fixes |
| [Diagnostics](troubleshooting/diagnostics.md) | System diagnostics and debugging |
| [Backend Status](troubleshooting/backend-status.md) | Backend health and status |

---

## Project Structure

```
MuebleriaIris/
├── src/                  # Frontend (Astro + React)
├── backend/              # API Server (Flask + PostgreSQL)
├── agents/               # AI Agent Skills
├── docs/                 # Documentation (you are here)
├── public/               # Static assets
└── .github/skills/       # GitHub Copilot compatibility
```

For the main project README, see [../README.md](../README.md)
