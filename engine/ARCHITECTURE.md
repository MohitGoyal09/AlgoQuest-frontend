# Sentinel — System Architecture

## High-Level Diagram

```
+-------------------------------------------------------------+
|                       CLIENT TIER                            |
|  Next.js 16 (App Router) + TypeScript + Tailwind CSS 4      |
|  shadcn/ui + Radix UI + D3.js + Recharts                    |
|  Supabase JS (auth/session via HttpOnly cookies)             |
+--------------------------+----------------------------------+
                           | HTTPS REST + SSE Streaming
+--------------------------v----------------------------------+
|                    APPLICATION TIER                           |
|  FastAPI 0.109 (Python 3.12)                                 |
|                                                              |
|  +--------------+ +--------------+ +------------------+     |
|  | Safety Valve  | | Talent Scout | | Culture Thermo.  |     |
|  | (burnout)     | | (network)    | | (team health)    |     |
|  +--------------+ +--------------+ +------------------+     |
|                                                              |
|  +--------------+ +--------------+ +------------------+     |
|  | Orchestrator  | | Composio MCP | | WebSocket Mgr    |     |
|  | (3-agent)     | | (ext tools)  | | (live updates)   |     |
|  +--------------+ +--------------+ +------------------+     |
|                                                              |
|  Middleware: RequestID > Security > Tenant > RateLimit > CORS|
+---------------+--------------------+------------------------+
                |                    |
  +-------------v------+   +--------v-----------+
  | PostgreSQL (Supa)   |   | Redis              |
  | schema: analytics   |   | - MCP session cache|
  |   events            |   | - Distributed locks|
  |   risk_scores       |   | - Rate-limit       |
  |   risk_history      |   +--------------------+
  |   graph_edges       |
  |   centrality_scores |   +--------------------+
  |   skill_profiles    |   | Supabase Auth      |
  | schema: identity    |   | - JWT (RS256)      |
  |   users (encrypted) |   | - SSO providers    |
  |   audit_logs        |   +--------------------+
  |   tenants           |
  |   tenant_members    |   +--------------------+
  |   teams             |   | Composio           |
  |   notifications     |   | - Google Calendar  |
  |   workflow_*        |   | - Slack            |
  +---------------------+   | - GitHub           |
                             +--------------------+

```

## Backend Architecture

**Entry point**: `backend/app/main.py`

At startup, SQLAlchemy auto-creates tables from three `Base.metadata` declarations (analytics, identity, notification) and registers SSO providers from environment variables.

### Middleware Stack (outermost to innermost)

1. `RequestIDMiddleware` — assigns `X-Request-ID` for distributed tracing
2. `SecurityMiddleware` — OWASP security headers, input sanitization
3. `TenantContextMiddleware` — extracts `tenant_id` from JWT or `X-Tenant-ID` header
4. `RateLimitMiddleware` — token-bucket algorithm per client IP
5. `CORSMiddleware` — enforces `ALLOWED_ORIGINS`

### Three Engines


| Engine              | Service File               | Input                        | Output                             |
| ------------------- | -------------------------- | ---------------------------- | ---------------------------------- |
| Safety Valve        | `services/safety_valve.py` | `analytics.events`           | `risk_scores`, `risk_history`      |
| Talent Scout        | `services/talent_scout.py` | `analytics.graph_edges`      | `centrality_scores`                |
| Culture Thermometer | `services/culture_temp.py` | `risk_scores`, `graph_edges` | Team health report (not persisted) |


Engines are triggered on-demand via API calls, via background tasks after persona creation, or via WebSocket ping responses.

### LLM Integration

- Provider: Gemini 2.5 Flash via OpenAI-compatible endpoint (classification) + google-genai SDK (function calling)
- Three modes: single-turn completion, multi-turn chat, SSE token streaming
- Role-scoped system prompts per tier (employee/manager/admin)
- The LLM never sees raw behavioral data — only mathematical outputs
- Refusal classifier for out-of-scope queries

### Data Flow: Event to Risk Score

```
External source (GitHub webhook, Slack, CSV)
    |
    v
POST /api/v1/ingestion/...
    |
    v
PrivacyEngine.hash_identity(email)     ← HMAC-SHA256 + salt
    |                       |
    v                       v
analytics.events        identity.users (email_encrypted)
    |
    v
SafetyValve.analyze(user_hash)
    ├─ Velocity (linregress)
    ├─ Circadian entropy (Shannon)
    └─ Belongingness (reply rate)
    |
    v
analytics.risk_scores → WebSocket broadcast → connected clients
```

### Data Flow: AI Chat Request

```
POST /api/v1/ai/chat/stream
    |
    v
IntentClassifier (Gemini 2.5 Flash)    ← 3-way: org/task/general
    |
    v
Orchestrator routes to selected agent
    |
    v
org_agent:     RefusalClassifier → DataBoundaryEnforcer → LLM (with context)
task_agent:    Composio tool execution → LLM (with tool data)
general_agent: LLM (no data access)
    |
    v
SSE stream → frontend
```

## Frontend Architecture

- **Framework**: Next.js 16 with App Router
- **Auth**: Supabase JS + `@supabase/ssr` — tokens in HttpOnly cookies
- **Session validation**: Next.js edge middleware (`middleware.ts`) validates before rendering
- **API calls**: `Authorization: Bearer <token>` + `X-Tenant-ID` headers
- **Real-time**: SSE for chat, WebSocket for risk updates

### Key Frontend Routes

```
/dashboard          Role-adaptive (employee/manager/admin tabs)
/ask-sentinel       3-agent AI chat with SSE streaming
/engines            Safety Valve, Talent Scout, Culture Thermometer
/talent-scout       Network graph visualization (D3.js)
/team-health        Team health dashboard
/marketplace        Composio tool integrations (OAuth popup flow)
/admin              Users, Teams, Audit Logs tabs
/notifications      Notification center with preferences
/simulation         Demo persona injection
/profile            User profile and consent controls
```

## Deployment

### Development

```
localhost:3000  ─── Next.js dev server (pnpm dev)
localhost:8000  ─── FastAPI (uvicorn --reload)
localhost:5432  ─── PostgreSQL
localhost:6379  ─── Redis
```

### Docker Compose

Four services: backend (port 8000), frontend (port 3000), db (postgres:14-alpine), redis (redis:7-alpine).

### Production Recommendations

- Supabase as managed PostgreSQL + auth
- Gunicorn + Uvicorn workers for FastAPI
- Managed Redis (Upstash, Redis Cloud)
- Reverse proxy (nginx/Caddy) for TLS + WebSocket upgrade
- `ENVIRONMENT=production` enables HSTS headers
- `SIMULATION_MODE=false` disables demo seeding endpoints

