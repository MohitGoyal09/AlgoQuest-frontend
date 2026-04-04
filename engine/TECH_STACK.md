# Sentinel — Tech Stack

## Backend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Runtime | Python | 3.12 | |
| Package Manager | uv | Latest | Replaces pip/poetry |
| Framework | FastAPI | 0.109 | ASGI, auto-docs at `/docs` |
| ORM | SQLAlchemy | 2.x | **SYNC mode** (not async) |
| Validation | Pydantic | v2 | Request/response schemas |
| Database | PostgreSQL | 14+ | Via Supabase |
| Cache | Redis | 7+ | Optional, falls back to in-memory |
| Math | NumPy, SciPy | Latest | linregress, Shannon entropy, odeint |
| Graph | NetworkX | Latest | Betweenness, eigenvector centrality |
| LLM (classification) | Gemini 2.5 Flash | Latest | Via OpenAI-compatible endpoint |
| LLM (function calling) | Gemini 2.5 Flash | Latest | Via google-genai SDK |
| LLM Wrapper | LiteLLM | Latest | Multi-provider abstraction |
| Auth | Supabase Auth | Latest | RS256 JWT, SSO providers |
| Encryption | cryptography (Fernet) | Latest | AES-128-CBC + HMAC-SHA256 |
| External Tools | Composio SDK | 1.0+ | MCP Tool Router |
| ASGI Server | Uvicorn | Latest | Development; Gunicorn wrapper for prod |

### Backend Directory Structure

```
backend/app/
  api/v1/endpoints/    25 endpoint modules
  services/            27 service files
  models/              9 data model files
  core/                security.py, database.py, redis_client.py
  integrations/        composio_client.py
  middleware/          5 middleware layers
```

## Frontend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Framework | Next.js | 16 | App Router |
| Language | TypeScript | 5.x | Strict mode |
| UI Library | shadcn/ui + Radix UI | Latest | 40+ primitives |
| Styling | Tailwind CSS | 4.x | Dark/light themes |
| Charts | Recharts | Latest | Velocity, risk history |
| Network Graph | D3.js | Latest | Force-directed layout |
| Font | Geist | Latest | Display + Mono (Vercel) |
| Auth Client | Supabase JS + @supabase/ssr | Latest | HttpOnly cookies |
| Notifications | Sonner | Latest | Toast notifications |

### Frontend Directory Structure

```
frontend/
  app/                 29 page routes (App Router)
  components/          100+ components
    chat/              Chat interface, tool cards, connection cards
    ui/                shadcn/ui primitives
  lib/                 api.ts, utils, hooks
  docs/                DESIGN.md (design system)
```

## LLM Configuration

Sentinel uses Gemini 2.5 Flash in two modes:

1. **Classification** (Intent Classifier): Via OpenAI-compatible endpoint at `generativelanguage.googleapis.com/v1beta/openai/`. JSON response format. Temperature 0.1. Used for 3-way intent routing (org/task/general).

2. **Generation** (All agents): Via LiteLLM wrapper. SSE token streaming. Role-scoped system prompts. Temperature varies by agent.

Env vars: `GEMINI_API_KEY` (primary), `LLM_MODEL` (default: `gemini-2.0-flash`).

Portkey AI Gateway is supported as an optional proxy layer: `PORTKEY_API_KEY`, `PORTKEY_VIRTUAL_KEY`.

## External Integrations

| Integration | Provider | Purpose |
|-------------|----------|---------|
| Auth + DB | Supabase | PostgreSQL hosting, JWT issuance, email templates, SSO |
| External Tools | Composio | Google Calendar, Slack, GitHub, Gmail tool execution |
| LLM | Google (Gemini) | Intent classification, text generation, function calling |

## Configuration

All config is in `backend/app/config.py` via Pydantic `BaseSettings`. Values come from `.env` file or environment variables.

### Required Env Vars

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | 32+ char secret for token signing |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon key |
| `VAULT_SALT` | Salt for HMAC-SHA256 identity hashing |
| `ENCRYPTION_KEY` | 44-char base64 key for Fernet encryption |
| `GEMINI_API_KEY` | Google AI API key |

### Optional Env Vars

| Variable | Default | Purpose |
|----------|---------|---------|
| `COMPOSIO_API_KEY` | `""` | Enables external tool integration |
| `REDIS_URL` | `redis://localhost:6379/0` | Cache and session store |
| `SIMULATION_MODE` | `true` | Enables demo seeding endpoints |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allow-list |
| `ENVIRONMENT` | `development` | Set `production` for HSTS |
| `SEED_PASSWORD` | `""` | Password for demo seed users |

## Development Commands

```bash
# Backend
cd backend
uv sync                              # Install dependencies
uvicorn app.main:app --reload        # Start dev server (port 8000)
python -m scripts.demo_seed          # Seed demo data
pytest                               # Run tests

# Frontend
cd frontend
pnpm install                         # Install dependencies
pnpm dev                             # Start dev server (port 3000)
```
