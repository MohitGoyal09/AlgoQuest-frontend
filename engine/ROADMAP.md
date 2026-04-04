# Sentinel — Roadmap

Updated: 2026-04-05

## What's Shipped

Everything below is working code, tested, and integrated.

| Category | Deliverables |
|----------|-------------|
| **3-Agent Orchestrator** | IntentClassifier (Gemini Flash) → org_agent / task_agent / general_agent. Session-aware follow-up routing. 19 tests. |
| **MCP Tool Router** | Composio MCP sessions with Gemini Automatic Function Calling. LLM autonomously discovers and calls 500+ tools. Connected accounts passed to tool_router.create(). |
| **Engines** | Safety Valve (scipy linregress + Shannon entropy), Talent Scout (NetworkX betweenness/eigenvector), Culture Thermometer (SIR ODE model via scipy.integrate.odeint) |
| **Chat** | SSE streaming with typed events (token, tool_call, connection_link, classification, refusal, done). Stacked tool cards. "Thinking..." indicator. Stop preserves content. Tool call persistence in ChatHistory. |
| **RBAC** | 52-permission matrix, 3-tier roles, TenantMember with display_name, 36h critical override, refusal classifier |
| **Auth** | Supabase Auth, email + password, Google/Azure AD/SAML SSO, 4-layer defense-in-depth |
| **Privacy** | Two-vault architecture (HMAC-SHA256 + Fernet AES), PII masking in logs, open redirect protection |
| **Dashboard** | 3 role views (employee/manager/admin). Admin sees real employee names + risk data. |
| **Admin Panel** | Single page with 3 tabs (Members/Teams/Audit). Real names, team names, risk badges. Promote/demote/change team/remove with AlertDialog. Invite dialog. FK cascade on delete. |
| **Settings** | Modal from sidebar dropdown. Role-aware (employee privacy, manager anonymization, admin full access). Theme toggle. |
| **Marketplace** | Dynamic from Composio API (500+ tools, auto-paginate all pages). Tool detail view. OAuth popup + 3s polling. Banner with rotating taglines. Category filters (top 5 + Others). |
| **Tool Integration** | Real OAuth via auth_configs.create + connected_accounts.link. Connection link cards in chat. MCP cache invalidation. Marketplace ↔ chat sync via custom events + /invalidate-cache endpoint. |
| **Seed Data** | Deterministic (Random(42)). 5 persona archetypes. 550 events with rich metadata. 101 audit logs. 2 chat sessions. 7 blocking edges. Engine-compatible velocity scale (0-5). |
| **Context Engine** | 14 documentation files in engine/ for AI agent context. 17 files total including JUDGES, PITCH_STRATEGY, REAL_WORLD. |
| **Frontend** | Industrial/utilitarian design system. Geist font. Input pinned at bottom. Session persistence. Welcome screen with suggestion chips. Sidebar with search + new chat row. Chat history page with date grouping. |

## What's Partially Done

| Feature | What Exists | What's Missing |
|---------|-------------|----------------|
| Workflows | Models, UI page, template cards | End-to-end execution from chat intent |
| Data Ingestion | CSV upload works, pipeline status page | Real webhook receivers for Slack/GitHub/Calendar (uses seed data for demo) |
| Connection Auto-Resume | Backend polls after connection_link, detects OAuth completion | Sometimes the polling times out or the LLM doesn't auto-continue |
| Notifications | Full CRUD, preferences | Not triggered by engine analysis (manual only) |

## Hackathon Priorities (Before April 18)

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Engine validation (velocity scale fix) | DONE | Seed data now uses 0-5 scale matching engine output |
| Indicator key alignment | DONE | Frontend uses backend keys (chaotic_hours, social_withdrawal) |
| Hidden gem criteria fix | DONE | Frontend matches backend (eigenvector < 0.3 = under-recognized) |
| Org agent has centrality + culture data | DONE | Admin chat answers about hidden gems and team fragmentation |
| Admin panel shows real names + team names | DONE | display_name from TenantMember, team_name from Team table |
| Judge research + pitch strategy | DONE | 12 judge profiles, industry-tailored pitch, objection matrix |
| Demo script rehearsal | TODO | Practice the 3-minute flow with judge panel context |
| Settings modal polish | TODO | Better spacing, wider layout |

## Phase 2: Pilot Ready (Month 1-2)

Goal: Deploy with one real customer in shadow mode.

| Deliverable | Effort | Priority |
|-------------|--------|----------|
| Alembic database migrations | M | P0 |
| Real Slack webhook ingestion | M | P0 |
| Real GitHub webhook ingestion | M | P0 |
| Real Google Calendar API ingestion | M | P0 |
| Shadow mode (analyze without intervening) | M | P0 |
| HRMS connectors (SAP, Workday) for shift/overtime data | L | P0 |
| Non-tech event types (email_sent, ticket_created, document_edit) | M | P0 |
| Minimum group size threshold (configurable, default 5) | S | P0 |
| Risk factor attribution (contributing_factors + waterfall chart) | M | P0 |
| End-to-end test suite (Playwright) | L | P1 |
| Agent tests (org/task/general — currently zero coverage) | M | P1 |

**Success criteria**: One customer, 50+ employees, real data flowing for 30+ days.

## Phase 3: Production Ready (Month 3-6)

Goal: Validate core hypothesis. Enable real interventions.

| Deliverable | Effort | Priority |
|-------------|--------|----------|
| Correlation analysis: velocity vs actual burnout/attrition | XL | P0 |
| False positive/negative rate measurement | L | P0 |
| Threshold calibration from real data (replace hardcoded 2.5/1.5) | M | P0 |
| Enable nudge system for pilot customers | S | P0 |
| Key person risk simulation ("what if X leaves?") | M | P1 |
| Timezone-aware after_hours detection | S | P1 |
| On-call/sprint context enrichment in production | M | P1 |
| Weekly personal wellbeing email digest | S | P1 |
| SOC 2 Type II preparation | XL | P1 |
| India DPDP Act compliance review | L | P1 |

**Success criteria**: Velocity correlates to burnout with statistical significance. False positive rate < 20%.

## Phase 4: Scale (Month 6-12)

Goal: Commercial launch. Multi-customer. Revenue.

| Deliverable | Effort | Priority |
|-------------|--------|----------|
| Row-level security for multi-tenant scale | L | P0 |
| Self-service onboarding flow | L | P0 |
| Pricing engine and billing integration | L | P0 |
| TanStack Query migration (frontend data layer) | M | P1 |
| Microsoft Teams integration | M | P1 |
| Workday / BambooHR HRIS connectors | L | P1 |
| Manager effectiveness score | M | P1 |
| Public API documentation | M | P2 |

**Success criteria**: 10+ paying customers. $200K ARR. Employee NPS > 40.

## Technical Debt

| Item | Severity | Notes |
|------|----------|-------|
| No database migrations | High | Schema via create_all(checkfirst=True). Need Alembic. |
| No agent tests | High | org_agent, task_agent, general_agent have zero test coverage |
| No frontend tests | High | Zero component or E2E tests |
| No end-to-end tests | High | Need Playwright for critical flows |
| Engine tenant_id filtering inconsistent | Medium | Some engine queries skip tenant_id filter |
| Context-aware filtering crosses vault boundary | Medium | Safety Valve accesses Vault B for email. Documented tradeoff. |
| Hardcoded thresholds (velocity 2.5/1.5) | Medium | Not configurable per tenant |
| Module-level get_settings() in some files | Low | Can cause import failures in testing |
| LLM provider coupling | Low | Task agent requires google-genai. Fallback to openai-compat exists but untested. |

## Deferred Features

| Feature | Reason |
|---------|--------|
| File upload in chat | Not needed for MVP |
| WebSocket streaming (vs SSE) | SSE is simpler and sufficient |
| TanStack Query | Current useState+useEffect works, optional future optimization |
| Clarification cards with asyncio.Queue | Not needed yet — follow-up routing handles ambiguity |
| Tool-specific rich cards (gmail_preview) | LLM formats data as markdown — sufficient for demo |
| Employee personal growth dashboard | Designed but deprioritized for hackathon |
| Nudge response loop | Needs real user validation first |
