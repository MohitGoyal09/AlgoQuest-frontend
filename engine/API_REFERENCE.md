# Sentinel — API Reference

**Base URL**: `http://localhost:8000`
**API prefix**: `/api/v1`
**Auth header**: `Authorization: Bearer <supabase_access_token>`
**Tenant header**: `X-Tenant-ID: <uuid>` (optional; also read from JWT claims)
**Docs**: `http://localhost:8000/docs` (Swagger UI auto-generated)

## System (No Auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | System identity + engine list |
| GET | `/health` | Health check (`{"status": "healthy"}`) |
| GET | `/ready` | Readiness probe (DB + Redis connectivity) |

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create account + default tenant |
| POST | `/auth/login` | No | Email/password sign-in → tokens + tenant list |
| POST | `/auth/refresh` | No | Exchange refresh token |
| POST | `/auth/logout` | Yes | Sign out (client-side invalidation) |
| POST | `/auth/forgot-password` | No | Send reset email |
| POST | `/auth/reset-password` | No | Set new password with reset token |
| GET | `/auth/me` | Yes | Profile + tenant list |
| POST | `/auth/switch-tenant` | Yes | Switch active workspace |

## SSO

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sso/{provider}/login` | Initiate SSO flow (google / azure_ad / saml) |
| GET | `/sso/{provider}/callback` | OAuth/SAML callback (redirects to frontend) |

## Engines

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/engines/personas` | Yes | Create simulation persona with 30-day synthetic data |
| GET | `/engines/users/{hash}/safety` | Yes | Safety Valve burnout analysis |
| GET | `/engines/users/{hash}/talent` | Yes | Talent Scout network analysis |
| POST | `/engines/teams/culture` | Yes | Culture Thermometer team analysis |
| POST | `/engines/teams/forecast` | Yes | SIR epidemic contagion forecast |
| GET | `/engines/users/{hash}/nudge` | Yes | Generate LLM wellbeing nudge |
| POST | `/engines/users/{hash}/nudge/dismiss` | Yes | Log nudge dismissal |
| POST | `/engines/users/{hash}/nudge/schedule-break` | Yes | Log break scheduling |
| GET | `/engines/events` | Yes | Paginated event stream |
| POST | `/engines/events/inject` | Yes | Inject simulated event |
| GET | `/engines/users` | Yes | User list with risk scores (role-filtered) |
| GET | `/engines/users/{hash}/history` | Yes | Historical risk timeline |
| GET | `/engines/users/{hash}/context` | Yes | Contextual explanation for timestamp |
| GET | `/engines/dashboard/summary` | Yes | Role-filtered dashboard metrics |
| GET | `/engines/network/global/talent` | Yes | Global talent network |
| GET | `/engines/global/network` | Yes | Global network metrics |

## AI / Chat

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ai/chat` | Yes | Role-aware AI chat (single response) |
| POST | `/ai/chat/stream` | Yes | SSE streaming chat (3-agent orchestrator) |
| GET | `/ai/report/risk/{hash}` | Yes | LLM narrative risk report |
| GET | `/ai/report/team/{hash}` | Yes | LLM team health narrative |
| POST | `/ai/copilot/agenda` | Yes | AI-generated 1:1 talking points |
| POST | `/ai/query` | Yes | Natural language query over employee data |

### SSE Event Types (streaming chat)

| Event Type | Description |
|------------|-------------|
| `classification` | Agent routing result (agent name, confidence) |
| `token` | LLM text chunk |
| `tool_call` | Tool execution status (starting/complete/error) |
| `connection_link` | Inline OAuth prompt (tool not connected) |
| `refusal` | RBAC scope violation |
| `error` | Runtime error |
| `done` | Terminal event (always emitted) |

## Me (Employee Self-Service)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me/` | Yes | Own profile, risk score, audit trail |
| PUT | `/me/consent` | Yes | Update consent settings |
| POST | `/me/pause-monitoring` | Yes | Pause data collection (hours) |
| DELETE | `/me/data` | Yes | Delete all personal data (GDPR) |

## Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/health` | Admin | System health metrics |
| GET | `/admin/audit-logs` | Admin | System-wide audit logs (filterable) |
| GET | `/admin/users` | Admin | All users with roles and consent |
| PUT | `/admin/users/{hash}/role` | Admin | Update user role |
| POST | `/admin/invite` | Admin | Send invite email |
| POST | `/auth/accept-invite` | No | Accept invite with signed token |
| POST | `/admin/users/{hash}/promote` | Admin | Promote with safety guards |
| POST | `/admin/users/{hash}/demote` | Admin | Demote with safety guards |

## Admin Teams

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/teams` | Admin | List all teams |
| POST | `/admin/teams` | Admin | Create team |
| PUT | `/admin/teams/{id}` | Admin | Update team |
| DELETE | `/admin/teams/{id}` | Admin | Delete team |
| POST | `/admin/teams/{id}/members` | Admin | Assign member to team |
| DELETE | `/admin/teams/{id}/members/{hash}` | Admin | Remove member |
| PUT | `/admin/teams/{id}/manager` | Admin | Assign manager |

## Team

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/team/members` | Manager+ | Team member listing |
| POST | `/team/members/{hash}/reveal-identity` | Manager+ | Identity reveal (audit-logged) |

## Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications/` | Yes | List notifications (filterable) |
| POST | `/notifications/{id}/read` | Yes | Mark one as read |
| POST | `/notifications/read-all` | Yes | Mark all as read |
| DELETE | `/notifications/{id}` | Yes | Delete notification |
| GET | `/notifications/preferences` | Yes | Get preferences |
| PUT | `/notifications/preferences` | Yes | Update preferences |

## Connections (Composio OAuth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/connections/initiate` | Yes | Get OAuth redirect URL |
| GET | `/connections/callback` | No | OAuth callback → redirect to frontend |
| GET | `/connections/connected` | Yes | List connected tool slugs |
| GET | `/connections/toolkit-status` | Yes | Check if specific tool is connected |
| POST | `/connections/disconnect` | Yes | Remove a tool connection |

## External Tools

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tools/status` | Yes | Available tools and actions |
| POST | `/tools/execute` | Yes | Execute a tool action |
| POST | `/tools/calendar/analyze` | Yes | Meeting load burnout analysis |
| GET | `/tools/calendar/events/{id}` | Yes | Raw calendar events |
| POST | `/tools/slack/activity` | Yes | Slack message volume metrics |

## Other

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/analytics/team-energy-heatmap` | No | Aggregated risk heatmap data |
| GET/POST | `/tenants/` | Yes | Tenant CRUD |
| GET | `/roi/calculate` | Yes | Burnout cost + savings estimate |
| * | `/ingestion/*` | Admin | Data pipeline endpoints |
| * | `/workflows/*` | Yes | Workflow CRUD and execution |
| * | `/users/*` | Yes | User listing and search |

## WebSocket

| Path | Description |
|------|-------------|
| `ws://{host}/ws/{user_hash}` | Per-user risk updates (ping/pong, risk_update, manual_refresh) |
| `ws://{host}/ws/admin/team` | Admin team-level broadcast |

## Error Format

```json
{"detail": "Human-readable error message"}
```

Common status codes: 200 (OK), 201 (Created), 400 (Bad Input), 401 (No Auth), 403 (Forbidden), 404 (Not Found), 422 (Validation), 429 (Rate Limited), 500 (Server Error), 503 (Unavailable).
