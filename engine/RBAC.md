# Sentinel — RBAC & Access Control

## Role Hierarchy

Three tiers. Role is assigned per-tenant via `TenantMember.role`.

```
admin     → all endpoints, all users, system admin panel
manager   → own data + direct reports (consent-gated) + team aggregates
employee  → own data only (via /me endpoints)
```

## Source of Truth

`TenantMember` is the authoritative record for a user's role within a tenant. A user can be admin in one workspace and employee in another. Role lookups always query `TenantMember`, never a static user field.

## 52-Permission Matrix

Implemented in `backend/app/services/permission_service.py` with assertion: `assert len(PERMISSIONS) == 52`.

### Personal Permissions (16) — all roles

```
view_own_dashboard          view_own_wellbeing         view_own_risk
view_own_velocity           view_own_nudges            manage_own_consent
pause_own_monitoring        delete_own_data            use_ask_sentinel
create_personal_workflow    invoke_personal_workflow   generate_own_1on1_agenda
connect_own_tools           disconnect_own_tools       view_own_connections
view_own_audit_actions
```

### Team Permissions (12) — manager + admin

```
view_team_engines           view_team_safety_valve     view_team_talent_scout
view_team_culture_thermo    view_team_anonymized       reveal_team_identity
view_team_aggregates        run_simulation             generate_team_1on1_agenda
create_team_workflow        invoke_team_workflow       dispatch_team_nudge
```

### Organization Permissions (24) — admin only

```
view_org_engines            view_all_teams             view_org_health_map
manage_users                invite_users               promote_demote_roles
remove_users                manage_teams               assign_team_members
assign_team_manager         view_audit_logs            configure_thresholds
view_system_health          create_org_workflow        invoke_org_workflow
export_org_data             view_pipeline_health       configure_data_sources
upload_csv_data             manage_data_retention      view_ingestion_errors
trigger_engine_recompute    sync_hris                  manage_org_integrations
```

## Data Access Rules

| Accessor | Target | Allowed? | Conditions |
|----------|--------|----------|------------|
| Employee | Own data | Always | No conditions |
| Manager | Team member | Yes | `consent_share_with_manager = true` |
| Manager | Team member (CRITICAL 36h+) | Yes | Duty of care override (audit-logged) |
| Manager | Non-team member | No | Refused |
| Admin | Any user | Always | All access audit-logged |

## 36-Hour Critical Override

When a team member has been at CRITICAL risk continuously for 36+ hours, the manager can view their identity without explicit consent. This is a duty-of-care exception.

**Rules:**
- Manager must be the direct manager (same team)
- The risk must be CRITICAL (not ELEVATED)
- Duration must exceed 36 continuous hours
- The access is audit-logged with `action: identity_revealed`
- The employee is NOT notified in real-time (to prevent distress)

## Anonymization

Managers see anonymized identifiers by default:

| Risk Level | Display |
|------------|---------|
| LOW | `Dev-A1` (team member A1) |
| ELEVATED | `Dev-B3` |
| CRITICAL (< 36h) | `Dev-C2` (anonymized, consent-gated) |
| CRITICAL (>= 36h) | Real name shown (override, logged) |

Admin always sees real names.

## Refusal Classifier

**File**: `backend/app/services/refusal_classifier.py`

Runs before every org_agent response. Blocks queries that:
- Request data outside the user's RBAC scope
- Ask about specific individuals when the user lacks permission
- Attempt to extract PII or identity information
- Reference other tenants or workspaces

Refusals are audit-logged with `action: out_of_scope_query`.

The refusal classifier never reveals that data exists. A refused query gets a generic "I can't help with that" response, not "you don't have permission to see Jordan's data."

## Minimum Group Size Threshold

**Status: Planned**

When implemented: suppress individual-level data when team has fewer than 5 members, because a manager of a 2-person team can deduce identity by elimination. Show only aggregated team metrics for small teams.

## Implementation Details

**Backend enforcement:**
- `require_role("admin")` — FastAPI dependency, raises 403
- `PermissionService.can_view_user_data(accessor, target)` — data access control
- `DataBoundaryEnforcer` — builds role-scoped context for LLM prompts
- `RefusalClassifier` — blocks out-of-scope chat queries

**Frontend enforcement:**
- Sidebar navigation adapts to role
- Dashboard shows role-appropriate tabs
- Admin panel visible only to admins
- Team data visible only to managers + admins
