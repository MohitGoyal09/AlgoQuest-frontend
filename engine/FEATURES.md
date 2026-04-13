# Sentinel — Feature Inventory

## Status Key

- **Shipped**: Working code, tested, integrated end-to-end
- **Partial**: Backend or frontend exists but flow is incomplete
- **Planned**: Designed in specs but not built

## Feature Table

| # | Feature | Status | Backend | Frontend | Notes |
|---|---------|--------|---------|----------|-------|
| 1 | Dashboard (Employee) | Shipped | `/engines/dashboard/summary` | `/dashboard` | Personal wellbeing, velocity chart, nudge card, consent controls |
| 2 | Dashboard (Manager) | Shipped | Role-filtered endpoints | `/dashboard` | Team KPIs, anonymized roster, engine summaries, 1:1 agenda generator |
| 3 | Dashboard (Admin) | Shipped | `/admin/health` | `/dashboard` | Org overview tab, global stats, team health map |
| 4 | Safety Valve Engine | Shipped | `services/safety_valve.py` | `/engines` | Velocity (linregress), belongingness, entropy, context-aware filtering, 21-day window |
| 5 | Talent Scout Engine | Shipped | `services/talent_scout.py` | `/talent-scout` | NetworkX centrality, hidden gem detection, D3.js network graph |
| 6 | Culture Thermometer | Shipped | `services/culture_temp.py` + `sir_model.py` | `/team-health` | SIR contagion model (scipy.odeint), team fragmentation, communication decay |
| 7 | Ask Sentinel (Chat) | Shipped | `services/orchestrator.py` | `/ask-sentinel` | 3-agent orchestrator, SSE streaming, role-scoped context, session management |
| 8 | Chat Sessions | Shipped | `services/chat_history_service.py` | `/ask-sentinel` | CRUD, auto-title, latest-5 in sidebar, full history with search |
| 9 | Nudge System | Shipped | `services/nudge_dispatcher.py` | Dashboard card | LLM-generated wellbeing suggestions, dismiss/schedule-break actions |
| 10 | AI Copilot (1:1 Agenda) | Shipped | `POST /ai/copilot/agenda` | Manager dashboard | Risk-aware talking points and suggested actions |
| 11 | AI Risk Narratives | Shipped | `GET /ai/report/risk/{hash}` | Engine views | Individual and team LLM narrative reports |
| 12 | Natural Language Query | Shipped | `POST /ai/query` | Chat | "Who is at risk?", "Who are the hidden gems?", skill-based lookup |
| 13 | Simulation Panel | Shipped | `POST /engines/personas` | `/simulation` | 4 persona types (burnout, gem, steady, contagion), event injection |
| 14 | Network Graph | Shipped | Talent Scout API | `/talent-scout` | D3.js force-directed graph with spring layout |
| 15 | Velocity Chart | Shipped | `GET /engines/users/{hash}/history` | Dashboard | 30-day risk history with Recharts |
| 16 | Skills Radar | Shipped | `analytics.skill_profiles` | Profile view | 6-axis radar (technical, communication, leadership, collaboration, adaptability, creativity) |
| 17 | RBAC (52 Permissions) | Shipped | `services/permission_service.py` | All pages | 3-tier roles, Team model, TenantMember as role source, 36h override |
| 18 | Team Management | Shipped | `/admin/teams/*` | `/admin` Teams tab | CRUD teams, assign members, assign managers |
| 19 | User Management | Shipped | `/admin/users`, `/admin/invite` | `/admin` Users tab | Invite-only registration, promote/demote with safety guards |
| 20 | Identity Reveal | Shipped | `POST /team/members/{hash}/reveal-identity` | Manager view | Explicit endpoint, audit-logged, consent-gated |
| 21 | Audit Logs | Shipped | `GET /admin/audit-logs` | `/audit-log` | 17 action types, actor/target tracking, admin viewer |
| 22 | Notifications | Shipped | `/notifications/*` | `/notifications` | In-app with preferences, per-type/per-channel toggles |
| 23 | Auth (Email + SSO) | Shipped | `/auth/*`, `/sso/*` | `/login`, `/auth` | Supabase Auth, Google/Azure AD/SAML, MFA |
| 24 | Invite Flow | Shipped | `POST /admin/invite` | Accept-invite page | Admin sends signed link, accept-invite page |
| 25 | Tenant/Workspace | Shipped | `/tenants/*` | `/tenants` | Multi-tenant with workspace switching |
| 26 | Employee Self-Service | Shipped | `/me/*` | `/me`, `/profile` | Consent toggles, pause monitoring, GDPR data deletion |
| 27 | ROI Calculator | Shipped | `GET /roi/calculate` | Dashboard widget | Burnout cost calculation based on team size + salary |
| 28 | Design System | Shipped | N/A | All components | Geist font, emerald accent, dark/light themes, industrial aesthetic |
| 29 | Intent Classifier | Shipped | `services/intent_classifier.py` | N/A | Gemini 2.5 Flash LLM classification (org/task/general) |
| 30 | 3-Agent Orchestrator | Shipped | `services/orchestrator.py` | Chat SSE handling | org_agent, task_agent, general_agent routing |
| 31 | Composio OAuth Flow | Shipped | `/connections/*` | Marketplace | OAuth initiate/callback/connected/disconnect |
| 32 | Workflows (Automation) | Partial | Models exist (`workflow.py`) | `/workflows` | Templates + execution logging exist. End-to-end flow basic. |
| 33 | Marketplace (Tools) | Partial | `/tools/*`, `/connections/*` | `/marketplace` | Tool status/execution works. OAuth popup flow implemented. |
| 34 | Data Ingestion Pipeline | Partial | `services/ingestion.py` | N/A | Calendar sync and GitHub GraphEdge creation now work. Slack/Jira use seed data. |
| 35 | Data Ingestion UI | Shipped | Route exists | `/data-ingestion` | 640-line page with connector status, sync controls, pipeline monitoring |
| 36 | Onboarding Flow | Planned | Route exists | `/onboarding` | Basic page |
| 37 | Employee Growth Dashboard | Planned | N/A | N/A | Skill progress, career path, learning recs — designed, not built |
| 38 | Peer Recognition | Planned | N/A | N/A | Kudos as positive ONA signal — designed, not built |
| 39 | Key Person Risk Simulation | Planned | N/A | N/A | "What if this person leaves?" NetworkX removal — designed |
| 40 | Minimum Group Size Threshold | Planned | N/A | N/A | Suppress data when team < 5 members — designed |
| 41 | Methodology Page | Shipped | N/A | `/methodology` | Engine formulas, thresholds, accuracy disclaimer |
| 42 | CSV Export | Shipped | Admin dashboard | Export Report button | CSV download of engine reports |
| 43 | Team Comparison | Shipped | Admin dashboard | `/dashboard` | Side-by-side team stats comparison |
| 44 | Manager Action Plans | Shipped | Safety Valve | `/dashboard` | Context-aware recommendations for managers |
| 45 | Team Velocity Trends | Shipped | Admin dashboard | `/dashboard` | 30-day area chart of team velocity |
| 46 | Activity Calendar | Shipped | Admin dashboard | `/dashboard` | 14-day intensity heatmap |
| 47 | Mobile Navigation | Shipped | N/A | SidebarTrigger | Hamburger menu for mobile viewports |

## Backend File Counts

- **25 endpoint modules** in `backend/app/api/v1/endpoints/`
- **27 service files** in `backend/app/services/`
- **9 data models** in `backend/app/models/`
- **33 test files** in `backend/tests/`
- **5 middleware layers**

## Frontend Route Counts

- **30+ page routes** in `frontend/app/`
- **100+ components** (40+ shadcn/ui primitives, 30+ AI-element components, custom components)
