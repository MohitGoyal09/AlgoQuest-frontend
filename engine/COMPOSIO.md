# Sentinel — Composio Tool Integration

## Overview

Sentinel integrates with external workplace tools (Gmail, Google Calendar, Slack, GitHub) via the Composio SDK and MCP (Model Context Protocol) Tool Router. This enables the task_agent to execute real tool actions and enrich burnout analysis with objective data (meeting load, Slack activity, commit patterns).

## Architecture

```
User: "Check my emails"
    |
    v
IntentClassifier → task_agent
    |
    v
TaskAgent._detect_tool_type("email")
    |
    v
composio_client.is_available()?  ← checks COMPOSIO_API_KEY
    |
    v
Check connected tools for entity_id
    |
    ├─ Connected? → ComposioToolSet.execute_action()
    │                    |
    │                    v
    │               Tool data → inject into LLM prompt → stream response
    │
    └─ Not connected? → Emit connection_link SSE event
                             |
                             v
                        Frontend renders inline OAuth button
```

## Entity ID Format

Composio needs a human-readable entity ID that maps to OAuth accounts. Sentinel uses:

```
entity_id = "{user_email}-{environment}"
```

Example: `sarah.kim@sentinel.demo-development`

This is NOT the user_hash. The Composio SDK requires a readable identifier for OAuth account management.

## Available Tools

| Tool | Composio Toolkit | Actions |
|------|-----------------|---------|
| Gmail | `gmail` | List inbox, search emails, send email |
| Google Calendar | `googlecalendar` | List events, create event, analyze meeting load |
| Slack | `slack` | Search messages, get user, post message |
| GitHub | `github` | List commits, get pull request, list issues |

## OAuth Flow

Follows the KaraX pattern: popup-based auth with polling-based completion detection.

### Backend

**Endpoints**: `backend/app/api/v1/endpoints/connections.py`

1. **Initiate** (`POST /connections/initiate`)
   - Creates managed auth config: `composio.auth_configs.create(toolkit=slug, options={"type": "use_composio_managed_auth"})`
   - Generates connection link: `composio.connected_accounts.link(user_id=entity_id, auth_config_id=config.id, callback_url=...)`
   - Returns `redirect_url` for the OAuth consent page

2. **Callback** (`GET /connections/callback`)
   - Always redirects to frontend (never returns JSON)
   - Composio retries on non-200, so this must always return a redirect (302)
   - Frontend detects completion by polling

3. **Connected** (`GET /connections/connected`)
   - Lists all connected tool slugs for the current user
   - Queries Composio API on-demand (no local storage)

4. **Toolkit Status** (`GET /connections/toolkit-status?toolkit_name=gmail`)
   - Checks if a specific tool is connected
   - Used by chat interface for connection_link card decisions

5. **Disconnect** (`POST /connections/disconnect`)
   - Paginates through Composio REST API to find matching connections
   - Deletes all connections for the specified toolkit + entity_id

### Frontend

**Marketplace page**: `frontend/app/marketplace/page.tsx`

1. Opens OAuth consent in popup (600x700, centered)
2. Polls `GET /connections/connected` every 3 seconds until tool appears
3. 120-second timeout for OAuth flow
4. Detects popup close, waits 5 more seconds for connection to register

**Inline OAuth in chat**: `frontend/components/chat/connection-link-card.tsx`

When the task_agent detects a tool isn't connected, it emits a `connection_link` SSE event. The frontend renders an inline OAuth button in the chat message stream so users can connect without leaving the conversation.

## MCP Session Caching

Composio tool sessions (OAuth tokens, connection state) are cached in Redis with a 30-minute TTL (`MCP_SESSION_TTL_SECONDS`).

**File**: `backend/app/core/redis_client.py`

The async `RedisClient` wrapper provides:
- `set(nx=True)` for atomic session initialization
- Distributed locking to prevent concurrent token refresh races
- Configurable TTL via `MCP_SESSION_TTL_SECONDS` (default: 1800)
- Configurable lock timeout via `MCP_LOCK_TIMEOUT_SECONDS` (default: 30)

## Calendar Meeting Load Analysis

The `analyze_meeting_load` method on `ComposioClient` enriches Safety Valve analysis:

1. Fetches events via `GOOGLECALENDAR_LIST_EVENTS`
2. Calculates total and average daily meeting hours
3. Detects back-to-back meetings (< 15-minute gaps)
4. Compares against research baselines (4 hours/day, 20 hours/week)
5. Returns risk score (0-1) with HEALTHY / LOW / MODERATE / HIGH level

This adds objective calendar data to the burnout detection pipeline.

## MCP Tool Router

**File**: `backend/app/services/mcp_tool_router.py`

Routes tool execution requests from the task_agent through Composio. Maps tool names to Composio Action enums and handles authentication per entity_id.

## Tool-Augmented LLM

**File**: `backend/app/services/tool_augmented_llm.py`

Supports Gemini Automatic Function Calling (AFC) for cases where the LLM decides which tools to call. The LLM receives tool schemas, generates function calls, and Sentinel executes them via Composio and returns results.

## Configuration

| Env Var | Required | Purpose |
|---------|----------|---------|
| `COMPOSIO_API_KEY` | For tools | Enables all Composio functionality |
| `REDIS_URL` | Optional | MCP session caching (falls back to in-memory) |
| `MCP_SESSION_TTL_SECONDS` | Optional | Session cache TTL (default: 1800) |
| `MCP_LOCK_TIMEOUT_SECONDS` | Optional | Distributed lock timeout (default: 30) |

## Key Design Decisions

1. **No local connection storage**: Composio manages all connections. Query on-demand.
2. **Entity ID = email-environment**: Readable format for OAuth mapping (not user_hash).
3. **Callback always returns 200/302**: Composio retries on errors.
4. **OAuth popup, not redirect**: User stays on Sentinel. Frontend polls for completion.
5. **Connection checks are per-request**: No stale local cache of connection status.
6. **No Composio SDK on frontend**: All proxied through backend API.
