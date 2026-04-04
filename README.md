# Sentinel Frontend

AI-powered employee wellbeing dashboard — Next.js 16 with 3-agent chat, Composio marketplace, and role-based engine views.

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm: `npm install -g pnpm`
- A running Sentinel backend (see `backend/README.md`) or a remote API URL

### 1. Install Dependencies

```bash
cd frontend
pnpm install
```

### 2. Environment Setup

Create `.env.local` in the `frontend/` directory:

```env
# Required — get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Required — points to the FastAPI backend (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Required — WebSocket base URL
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

Both Supabase variables are validated at runtime — the app throws on startup if either is missing.

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the login page.

---

## Environment Variables


| Variable                        | Required | Description                | Example                        |
| ------------------------------- | -------- | -------------------------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL       | `https://xxx.supabase.co`      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anon key (public) | `eyJ...`                       |
| `NEXT_PUBLIC_API_URL`           | Yes      | Backend REST API base URL  | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_WS_URL`            | Yes      | Backend WebSocket base URL | `ws://localhost:8000/ws`       |


---

## Pages & Routes


| Route                   | Page                                                    | Access            |
| ----------------------- | ------------------------------------------------------- | ----------------- |
| `/login`                | Login (email + SSO)                                     | Public            |
| `/dashboard`            | Role-based dashboard (admin / manager / employee views) | All authenticated |
| `/ask-sentinel`         | AI chat with 3-agent orchestrator                       | All authenticated |
| `/ask-sentinel/history` | Chat session history                                    | All authenticated |
| `/engines/safety`       | Safety Valve — burnout detection                        | Manager, Admin    |
| `/engines/talent`       | Talent Scout — network analysis                         | Manager, Admin    |
| `/engines/culture`      | Culture Thermometer — team health                       | Manager, Admin    |
| `/engines/network`      | Interactive D3 social graph                             | Manager, Admin    |
| `/admin`                | Admin panel (Members / Teams / Audit tabs)              | Admin only        |
| `/notifications`        | Notification center                                     | All authenticated |
| `/data-ingestion`       | CSV upload + pipeline status                            | Manager, Admin    |
| `/profile`              | Personal wellbeing + privacy controls                   | All authenticated |
| `/me`                   | Employee self-service (consent, GDPR controls)          | All authenticated |
| `/simulation`           | Digital twin demo controls                              | Admin             |


---

## Design System

### Aesthetic Direction

Industrial/utilitarian — calm authority, no decorative noise. No gradients, no glassmorphism, no colored icon circles. Typography and spacing carry all visual hierarchy.

### Color Tokens


| Token                   | Usage                                         |
| ----------------------- | --------------------------------------------- |
| `bg-card`               | Card surfaces                                 |
| `border-border`         | All dividers and outlines                     |
| `text-foreground`       | Primary text                                  |
| `text-muted-foreground` | Secondary / label text                        |
| `primary`               | Emerald (`#10b981`) — the single accent color |


Risk semantic colors: `#22c55e` LOW, `#f59e0b` ELEVATED, `#ef4444` CRITICAL.

### Typography


| Role           | Size | Style                                  |
| -------------- | ---- | -------------------------------------- |
| Display / Hero | 24px | `font-semibold`                        |
| Body           | 14px | `font-normal`                          |
| UI Labels      | 11px | `font-medium uppercase tracking-wider` |
| KPI Values     | 28px | `font-semibold tabular-nums`           |
| Code           | 13px | Geist Mono                             |


Fonts are loaded via the `geist` npm package and injected as CSS variables in `app/layout.tsx`. Full token reference: `docs/DESIGN.md`.

---

## Key Components

### Chat System (`components/chat/`)

- `chat-interface.tsx` — primary SSE streaming interface; manages `AbortController` lifecycle
- Streams `text_delta`, `tool_call`, and `connection_link` events from `/ai/chat/stream`
- The SSE `done` event includes `session_id`, written to `?conv=` in the URL to make sessions bookmarkable
- Tool call results render as structured cards; OAuth links render with status polling

### Engine Views (`app/engines/`)

- `safety/` — burnout risk score, velocity meter, circadian indicators, 30-day history chart
- `talent/` — betweenness centrality, eigenvector centrality, hidden gem badge
- `culture/` — team aggregate health, SIR contagion forecast chart
- `network/` — D3 force-directed graph; nodes sized by betweenness, colored by risk level

### Admin Panel (`app/admin/`)

- Single page, three tabs: Members, Teams, Audit Log
- Real names via `display_name` from the backend profile
- Destructive actions use `AlertDialog` for confirmation

---

## Auth Flow

Authentication uses a 4-layer defense:

1. **Next.js middleware** (`middleware.ts`) — redirects unauthenticated requests to `/login`
2. `**ProtectedRoute` component** — client-side guard wrapping all authenticated pages
3. **Backend JWT verification** — every API request includes `Authorization: Bearer <token>`
4. **RBAC** — 52 permissions enforced on the backend; `role` from `AuthContext` controls UI visibility

The access token is cached via `setCachedAccessToken()` in `lib/api.ts` to avoid redundant Supabase calls per request.

---

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Production Build

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

### Docker

```bash
docker build -t sentinel-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:8000/api/v1 \
  -e NEXT_PUBLIC_WS_URL=ws://backend:8000/ws \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  sentinel-frontend
```

### Adding a New Page

1. Create `app/your-page/page.tsx`
2. Wrap content in `<ProtectedRoute>` (add `<RoleGuard roles={['admin']}>` for restricted pages)
3. Add a navigation entry in `components/app-sidebar.tsx`
4. Create a domain hook in `hooks/` if the page fetches data

---

## Demo Credentials

Seeded by `python -m scripts.demo_seed` on the backend. The shared password is set via `SEED_PASSWORD` in `backend/.env`.


| Email                    | Role     |
| ------------------------ | -------- |
| `admin@demo.sentinel`    | Admin    |
| `manager@demo.sentinel`  | Manager  |
| `employee@demo.sentinel` | Employee |


---

## Common Issues

**CORS errors on API calls**
The backend `ALLOWED_ORIGINS` must include `http://localhost:3000`. Check `backend/.env`.

**Stale TypeScript errors in `.next/types`**

```bash
rm -rf .next/types && pnpm dev
```

`**Missing NEXT_PUBLIC_SUPABASE_URL` on startup**
Verify `.env.local` is in the `frontend/` directory (not the repo root) and that both variable names include the `NEXT_PUBLIC_` prefix exactly.

**Login succeeds but all pages redirect back to `/login`**
The `JWT_SECRET` in `backend/.env` must match the JWT secret in your Supabase project (Settings > API > JWT Settings).

---

## Further Reading

- `docs/DESIGN.md` — full design system (color palette, type scale, component patterns)
- `engine/OVERVIEW.md` — product overview and two-vault privacy architecture
- `engine/TECH_STACK.md` — full stack reference and backend setup commands

