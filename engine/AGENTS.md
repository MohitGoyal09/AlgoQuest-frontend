# Sentinel — 3-Agent Orchestrator Architecture

## Overview

Every user message to Ask Sentinel is classified by Gemini 2.5 Flash and routed to one of three specialized agents. This replaces the earlier monolithic `sentinel_chat.py` with a clean pipeline.

```
User message
    |
    v
IntentClassifier (Gemini 2.5 Flash, temp=0.1, JSON mode)
    |
    v
+--[ classification: org / task / general ]--+
|                    |                        |
v                    v                        v
OrgAgent        TaskAgent           GeneralAgent
(RBAC + data)   (Composio tools)    (conversational)
|                    |                        |
v                    v                        v
SSE stream → frontend
```

## Intent Classifier

**File**: `backend/app/services/intent_classifier.py`

Uses Gemini 2.5 Flash (not the user's selected model) for fast, cheap, reliable JSON classification.

**Routing rules:**

| Agent | Triggers On |
|-------|-------------|
| `org_agent` | Team health, burnout risk, employee data, velocity, network analysis, engine queries, "who is at risk" |
| `task_agent` | Check emails, schedule meetings, Slack activity, GitHub PRs, connect/disconnect tools, "what integrations do I have" |
| `general_agent` | Greetings, general questions, "how does Sentinel work", jokes, meta-questions |

**Design decisions:**
- Includes last 3 conversation turns (6 messages) for follow-up detection
- Returns `is_followup` flag so orchestrator can skip re-classification
- Falls back to `general_agent` on any error (never blocks chat)
- Invalid agent names map to `general_agent`
- `ClassificationResult` is a frozen dataclass (immutable)

## Orchestrator

**File**: `backend/app/services/orchestrator.py`

The main entry point for Ask Sentinel chat. Exposed as `sentinel_orchestrator` singleton.

**Flow:**
1. Classify intent (calls IntentClassifier)
2. Emit `classification` SSE event (frontend shows "Checking org data..." etc.)
3. Select agent from `_agent_map`
4. Stream SSE events from the selected agent

**Always-emit-done contract:** Every path (success, error, cancel) emits a terminal `done` event. The frontend relies on this to know when streaming is complete.

## OrgAgent — Organizational Data

**File**: `backend/app/services/agents/org_agent.py`

The only agent with access to organizational data. Enforces RBAC.

**Pipeline:**
```
1. RefusalClassifier     → Block out-of-scope queries (audit-logged)
2. DataBoundaryEnforcer  → Build role-scoped context (employee/manager/admin)
3. LLM with context      → Stream response with engine data
```

**What it accesses:**
- Safety Valve: risk scores, velocity, entropy, belongingness
- Talent Scout: centrality scores, unblocking counts
- Culture Thermometer: team aggregates
- Role-scoped system prompts from `sentinel_chat.ROLE_SYSTEM_PROMPTS`

**Data boundary by role:**
- Employee: own risk level, velocity, belongingness, network influence
- Manager: own data + team size, team at-risk count
- Admin: own data + org total employees, org at-risk count

## TaskAgent — External Tool Execution

**File**: `backend/app/services/agents/task_agent.py`

Executes external tool actions via Composio SDK. Handles tool detection, connection checks, and data fetching.

**SSE event flow:**
```
1. tool_call (status: starting)    → shimmer pill in chat UI
2. [tool execution via Composio]
3. tool_call (status: complete)    → green check
   OR connection_link              → inline OAuth card if not connected
4. token chunks                    → LLM response using tool data
5. done                            → terminal event
```

**Entity ID format:** `user_email-environment` (not user_hash). Composio needs a human-readable entity ID for OAuth account mapping. Example: `sarah.kim@sentinel.demo-development`.

**Tool detection:** Regex patterns match user messages to tools:
- `email/inbox/mail/gmail` → email
- `calendar/schedule/meeting` → calendar
- `slack/channel/dm` → slack
- `github/pr/commit/issue` → github

**When tool is not connected:** Emits `connection_link` SSE event with `tool_slug` and `connect_url`. The frontend renders an inline OAuth button so users can connect without leaving chat.

## GeneralAgent — Conversational

**File**: `backend/app/services/agents/general_agent.py`

Pure conversational LLM with no data access. Cheapest path — no DB queries, no Composio calls.

**Handles:** Greetings, general knowledge, "how does Sentinel work", explanations.

**When asked about data or tools:** Tells the user to ask a specific question and Sentinel will automatically route to the right agent.

## SSE Event Vocabulary

All agents emit events as `data: {json}\n\n` strings.

| Event Type | Fields | Description |
|------------|--------|-------------|
| `classification` | agent, confidence, is_followup | Emitted by orchestrator before agent starts |
| `token` | content | LLM text chunk |
| `tool_call` | status, tool_name, description | Tool execution status (starting/processing/complete/error) |
| `connection_link` | tool_name, tool_slug, message, connect_url | Inline OAuth card |
| `refusal` | content, session_id | RBAC scope violation |
| `error` | content | Runtime error |
| `done` | agent, session_id, generated_at, [context_used, tool_used] | Terminal event (always emitted) |

## Chat History Storage

Messages are stored in `identity.chat_history` with:
- `session_id` for grouping conversations
- `role`: user / assistant / system / tool
- `metadata` JSONB: agent type, context used, tool call data

Auto-title: First message of a session triggers LLM-based title generation.

## Session Management

- Sessions are CRUD-managed via `ChatHistoryService`
- Latest 5 sessions shown in sidebar
- Full history page with search
- Session data includes all turns (user + assistant + tool messages)

## Frontend Integration

The chat interface (`frontend/components/chat/chat-interface.tsx`) handles:
- `classification` → shows agent indicator
- `token` → appends to message content
- `tool_call` → renders ToolCard component (pill with shimmer animation)
- `connection_link` → renders ConnectionLinkCard (inline OAuth button)
- `done` → finalizes message, saves to history
