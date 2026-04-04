# Sentinel — Data Model

## Two-Vault Privacy Architecture

The database enforces a cryptographic privacy boundary at the PostgreSQL schema level.

```sql
CREATE SCHEMA analytics;    -- Vault A: anonymous behavioral data (no PII possible)
CREATE SCHEMA identity;     -- Vault B: encrypted PII + RBAC data
```

**Rules:**
- No foreign key constraints between schemas
- `user_hash = HMAC-SHA256(email.lower(), VAULT_SALT).hexdigest()[:32]` links records
- Vault A never contains names, emails, or message content
- Vault B encrypts all PII with Fernet (AES-128-CBC + HMAC-SHA256)
- Cross-schema joins require the VAULT_SALT (not stored in DB)

## Identity Schema (Vault B)

### tenants

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| name | String | Organization name |
| slug | String (unique) | URL-safe identifier |
| plan | String | starter / pro / enterprise |
| status | String | active / inactive |
| settings | JSONB | Configurable thresholds, preferences |
| created_at | DateTime | |

### users (UserIdentity)

| Column | Type | Notes |
|--------|------|-------|
| user_hash | String(32) (PK) | HMAC-SHA256 of email — primary key everywhere |
| email_encrypted | Text | Fernet-encrypted email blob |
| slack_id_encrypted | Text | Fernet-encrypted Slack ID |
| consent_share_with_manager | Boolean | Opt-in for manager visibility |
| consent_share_anonymized | Boolean | Opt-in for anonymized aggregation |
| monitoring_paused_until | DateTime | Temporal consent control |
| is_active | Boolean | Soft delete support |
| created_at | DateTime | |

### tenant_members

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| tenant_id | UUID (FK → tenants) | |
| user_hash | String(32) | References users.user_hash |
| role | String | admin / manager / employee |
| team_id | UUID (FK → teams) | Nullable |
| invited_by | String | Hash of the inviting user |
| created_at | DateTime | |

**This is the source of truth for role assignment.** Role is per-tenant — a user can be admin in one workspace and employee in another.

### teams

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| tenant_id | UUID (FK → tenants) | |
| name | String | Team display name |
| manager_hash | String(32) | Hash of the team manager |
| created_at | DateTime | |

### audit_logs

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| tenant_id | UUID | |
| actor_hash | String(32) | Who performed the action |
| actor_role | String | Role at time of action |
| action | String | One of 17+ action types |
| target_hash | String(32) | Whose data was accessed (nullable) |
| metadata | JSONB | Context details |
| ip_address | String | Request origin |
| created_at | DateTime | Immutable (no update/delete API) |

**Action types include:** `user_invited`, `invite_accepted`, `auth:login`, `role_changed`, `consent_changed`, `data_exported`, `engine_run`, `nudge_sent`, `identity_revealed`, `tool_connected`, `tool_disconnected`, `ask_sentinel_query`, `out_of_scope_query`, and more.

### notifications

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_hash | String(32) | Recipient |
| type | String | auth / security / team / engine |
| title | String | |
| message | Text | |
| priority | String | normal / high / urgent |
| data | JSONB | Additional payload |
| action_url | String | Click target (nullable) |
| read | Boolean | |
| read_at | DateTime | |
| created_at | DateTime | |

### notification_preferences

| Column | Type | Notes |
|--------|------|-------|
| user_hash | String(32) | |
| channel | String | in_app / email |
| notification_type | String | auth / security / team / engine |
| enabled | Boolean | |

### invitations

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| email | String | Plaintext (consumed on accept) |
| role | String | Assigned role |
| team_id | UUID | Target team (nullable) |
| invited_by | String(32) | Inviter's user_hash |
| token | String | Signed invite token |
| accepted_at | DateTime | Null until accepted |
| created_at | DateTime | |

### chat_history

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_hash | String(32) | |
| session_id | String | Groups messages into conversations |
| role | String | user / assistant / system / tool |
| content | Text | Message content |
| metadata | JSONB | Agent type, context used, tool data |
| created_at | DateTime | |

## Analytics Schema (Vault A)

### events

| Column | Type | Notes |
|--------|------|-------|
| id | Integer (PK) | Auto-increment |
| user_hash | String(32) | Anonymous identifier |
| tenant_id | UUID | Workspace isolation |
| timestamp | DateTime | Event time |
| event_type | String | commit / pr_review / slack_message / standup / etc. |
| metadata | JSONB | `{after_hours, context_switches, is_reply, files_changed, channel, source}` |

**Index:** Composite on `(user_hash, timestamp)` — most common query pattern.

### risk_scores

| Column | Type | Notes |
|--------|------|-------|
| user_hash | String(32) (PK) | |
| tenant_id | UUID | |
| velocity | Float | Slope of linear regression on activity |
| risk_level | String | LOW / ELEVATED / CRITICAL |
| confidence | Float | R-squared value |
| belongingness | Float | Social engagement score |
| circadian_entropy | Float | Schedule chaos metric |
| updated_at | DateTime | |

### risk_history

| Column | Type | Notes |
|--------|------|-------|
| id | Integer (PK) | |
| user_hash | String(32) | |
| tenant_id | UUID | |
| timestamp | DateTime | |
| risk_level | String | |
| velocity | Float | |
| confidence | Float | |
| belongingness | Float | |

### graph_edges

| Column | Type | Notes |
|--------|------|-------|
| id | Integer (PK) | |
| source_hash | String(32) | |
| target_hash | String(32) | |
| tenant_id | UUID | |
| weight | Float | Interaction strength |
| edge_type | String | collaboration / code_review / mentorship / blocking |

### centrality_scores

| Column | Type | Notes |
|--------|------|-------|
| user_hash | String(32) (PK) | |
| tenant_id | UUID | |
| betweenness | Float | Bridge between disconnected teams |
| eigenvector | Float | Connected to influential people |
| unblocking_count | Integer | Times they unblocked others |
| knowledge_transfer_score | Float | Mentorship effectiveness |

### skill_profiles

| Column | Type | Notes |
|--------|------|-------|
| user_hash | String(32) (PK) | |
| tenant_id | UUID | |
| technical | Integer | 0-100 |
| communication | Integer | 0-100 |
| leadership | Integer | 0-100 |
| collaboration | Integer | 0-100 |
| adaptability | Integer | 0-100 |
| creativity | Integer | 0-100 |

## Workflow Tables

### user_integrations

Tracks OAuth connections per user (Composio). Stores integration ID, account identifier, granted scopes, token expiry, connection status. Unique on `(user_hash, tenant_id, integration_id, account_id)`.

### workflow_templates

Pre-built automation recipes. Fields: `prompt_template`, `required_integrations` list, `parameters` dict, `is_system` flag.

### workflow_executions

Audit log of every workflow run: original message, `tools_used`, `integrations_used`, timing per phase, full LLM conversation, result artifacts.

## Entity-Relationship Summary

```
identity.tenants ──< identity.tenant_members >── identity.users
                                                       │
                         ┌─────────────────────────────┤
                         │                             │
                   (via user_hash)              identity.audit_logs
                         │                      identity.notifications
                         │                      identity.chat_history
                         │
             analytics.events
             analytics.risk_scores
             analytics.risk_history
             analytics.graph_edges (source_hash + target_hash)
             analytics.centrality_scores
             analytics.skill_profiles
```

Cross-schema relationships are application-level hash lookups only. No FK constraints between analytics and identity.

## Key Design Decisions

1. **user_hash as PK**: Single `DELETE WHERE user_hash = ?` removes all analytics for GDPR erasure
2. **JSONB for event metadata**: Flexible payloads without schema migrations
3. **No ARRAY columns**: JSON used instead for SQLite dev/test compatibility
4. **Composite indexes on (user_hash, timestamp)**: Optimizes "recent events for user" queries
5. **tenant_id on all tables**: Workspace isolation without cross-schema FK
