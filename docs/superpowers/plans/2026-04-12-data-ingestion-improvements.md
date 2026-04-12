# Data Ingestion Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Sentinel's data ingestion pipeline demo-ready with live connectors and real-time data flow visualization.

**Architecture:** Fix broken plumbing in the backend ingestion endpoint (hardcoded statuses, missing tenant_id, wrong event type filter), add Calendar sync to DataSyncService, add GraphEdge creation to GitHub sync, and enhance the frontend data-ingestion page with dynamic connector cards, live sync feedback, and one-click connect flow.

**Tech Stack:** Python 3.12 / FastAPI (backend), Next.js 16 / React 19 / TypeScript (frontend), Composio SDK (tool connections), SQLAlchemy (ORM)

---

### Task 1: Fix SafetyValve Belongingness Event Type Filter (A3)

**Files:**
- Modify: `backend/app/services/safety_valve.py:258`

- [ ] **Step 1: Fix the event type filter**

In `_calculate_belongingness`, add `"pr_review"` to the event type filter so GitHub PR review activity contributes to the belongingness score:

```python
# backend/app/services/safety_valve.py, line 258
# Change:
interactions = [
    e for e in events if e.event_type in ["slack_message", "pr_comment"]
]
# To:
interactions = [
    e for e in events if e.event_type in ["slack_message", "pr_comment", "pr_review"]
]
```

- [ ] **Step 2: Verify the change**

```bash
cd backend && python3 -c "
from app.services.safety_valve import SafetyValveEngine
import inspect
src = inspect.getsource(SafetyValveEngine._calculate_belongingness)
assert 'pr_review' in src, 'pr_review not in filter'
print('OK: pr_review is in belongingness filter')
"
```

- [ ] **Step 3: Commit**

```bash
git add app/services/safety_valve.py
git commit -m "fix: include pr_review in SafetyValve belongingness calculation"
```

---

### Task 2: Fix CSV Upload Missing tenant_id (A2)

**Files:**
- Modify: `backend/app/api/v1/endpoints/ingestion.py:314-319`

- [ ] **Step 1: Add tenant_id to CSV-created Events**

In the `upload_csv` endpoint, the `Event` creation at line 314 is missing `tenant_id`. The `user` dependency (from `require_role`) is a `TenantMember` which has `tenant_id`. Add it:

```python
# backend/app/api/v1/endpoints/ingestion.py, line 314
# Change:
db_event = Event(
    user_hash=user_hash,
    event_type=event_type,
    timestamp=ts,
    metadata_=metadata if metadata else {"source": source},
)
# To:
db_event = Event(
    user_hash=user_hash,
    tenant_id=user.tenant_id,
    event_type=event_type,
    timestamp=ts,
    metadata_=metadata if metadata else {"source": source},
)
```

- [ ] **Step 2: Verify**

```bash
cd backend && python3 -c "
import inspect
from app.api.v1.endpoints.ingestion import upload_csv
src = inspect.getsource(upload_csv)
assert 'tenant_id=user.tenant_id' in src or 'tenant_id' in src
print('OK: tenant_id is set on CSV events')
"
```

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/endpoints/ingestion.py
git commit -m "fix: set tenant_id on CSV-uploaded events"
```

---

### Task 3: Dynamic Connector Status from Composio (A1)

**Files:**
- Modify: `backend/app/api/v1/endpoints/ingestion.py:90-145`

- [ ] **Step 1: Update the /status endpoint to query real Composio connections**

Replace the hardcoded connector statuses with dynamic lookups. The `user` from `require_role` is a `TenantMember` — we need to resolve their entity_id and query Composio:

```python
# backend/app/api/v1/endpoints/ingestion.py

# Add these imports at the top (after existing imports):
from app.integrations.composio_client import composio_client
from app.config import get_settings

# Replace the /status endpoint (lines 90-212) with:
@router.get("/status")
async def get_pipeline_status(db: Session = Depends(get_db), user=Depends(require_role("admin", "manager"))):
    """Get full pipeline status including connectors, stages, metrics."""
    # Query actual DB counts
    try:
        total_events = db.query(func.count(Event.id)).scalar() or 0
        total_users = db.query(func.count(UserIdentity.user_hash)).scalar() or 0
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        recent_count = db.query(func.count(Event.id)).filter(
            Event.timestamp >= one_hour_ago
        ).scalar() or 0
    except Exception:
        total_events = _pipeline_metrics["total_ingested"]
        total_users = 0
        recent_count = 0

    # Query real Composio connection status
    connected_tools: list[str] = []
    try:
        settings = get_settings()
        email = privacy.decrypt(
            db.query(UserIdentity).filter_by(user_hash=user.user_hash).first().email_encrypted
        ) if db.query(UserIdentity).filter_by(user_hash=user.user_hash).first() else ""
        entity_id = f"{email}-{settings.environment}" if email else ""
        if entity_id and composio_client.is_available():
            connected_tools = await composio_client.get_connected_integrations(entity_id)
            connected_tools = [t.lower() for t in connected_tools]
    except Exception as e:
        logger.debug("Could not fetch Composio connections: %s", e)

    # Map Composio tool slugs to connector names
    TOOL_CONNECTOR_MAP = {
        "github": "Git",
        "slack": "Slack",
        "slackbot": "Slack",
        "googlecalendar": "Calendar",
        "google_calendar": "Calendar",
    }

    def connector_status(name: str) -> str:
        for tool_slug, connector_name in TOOL_CONNECTOR_MAP.items():
            if connector_name == name and tool_slug in connected_tools:
                return "connected"
        return "not_configured"

    csv_events = _pipeline_metrics["events_by_source"].get("csv", 0)
    connectors = [
        ConnectorInfo(
            name="Git",
            status=connector_status("Git"),
            icon="git-branch",
            events_ingested=_pipeline_metrics["events_by_source"].get("git", 0),
            description="Commit history, PR reviews, code frequency. Connect via Integrations.",
        ),
        ConnectorInfo(
            name="Slack",
            status=connector_status("Slack"),
            icon="message-square",
            events_ingested=_pipeline_metrics["events_by_source"].get("slack", 0),
            description="Message patterns, response times. Connect via Integrations.",
        ),
        ConnectorInfo(
            name="Jira",
            status="not_configured",
            icon="clipboard-list",
            events_ingested=_pipeline_metrics["events_by_source"].get("jira", 0),
            description="Sprint velocity, ticket lifecycle. Connect via Integrations.",
        ),
        ConnectorInfo(
            name="Calendar",
            status=connector_status("Calendar"),
            icon="calendar",
            events_ingested=_pipeline_metrics["events_by_source"].get("calendar", 0),
            description="Meeting load, focus time. Connect via Integrations.",
        ),
        ConnectorInfo(
            name="CSV Upload",
            status="connected",
            icon="upload",
            events_ingested=csv_events,
            last_sync=datetime.utcnow().isoformat() if csv_events > 0 else None,
            description="Manual data import — always available.",
        ),
    ]

    sm = _pipeline_metrics["stage_metrics"]
    pipeline_stages = [
        PipelineStage(name="Collection", status="active", processed=total_events,
                      error_count=sm["Collection"]["error_count"],
                      last_processed_at=sm["Collection"]["last_processed_at"],
                      description="Webhooks & API polling from connected sources"),
        PipelineStage(name="Validation", status="active", processed=total_events,
                      error_count=sm["Validation"]["error_count"],
                      last_processed_at=sm["Validation"]["last_processed_at"],
                      description="Schema validation, deduplication, timestamp normalization"),
        PipelineStage(name="Privacy Layer", status="active", processed=total_users,
                      error_count=sm["Privacy Layer"]["error_count"],
                      last_processed_at=sm["Privacy Layer"]["last_processed_at"],
                      description="HMAC hashing, AES-256 encryption, PII removal"),
        PipelineStage(name="Storage", status="active", processed=total_events,
                      error_count=sm["Storage"]["error_count"],
                      last_processed_at=sm["Storage"]["last_processed_at"],
                      description="Dual-vault architecture (Vault A: analytics, Vault B: identity)"),
        PipelineStage(name="Engine Processing", status="active", processed=total_events,
                      error_count=sm["Engine Processing"]["error_count"],
                      last_processed_at=sm["Engine Processing"]["last_processed_at"],
                      description="Safety Valve, Talent Scout, Culture Thermometer analysis"),
    ]

    return {
        "mode": "live" if connected_tools else "simulation",
        "connectors": [c.model_dump() for c in connectors],
        "pipeline_stages": [s.model_dump() for s in pipeline_stages],
        "metrics": {
            "total_events": total_events + _pipeline_metrics["total_ingested"],
            "total_users": total_users,
            "events_per_hour": recent_count + _pipeline_metrics.get("events_last_hour", 0),
            "avg_latency_ms": 0.0,
            "error_rate": round(
                _pipeline_metrics["total_errors"]
                / max(_pipeline_metrics["total_ingested"] + total_events, 1) * 100, 2,
            ),
            "uptime_hours": round(
                (datetime.utcnow() - datetime.fromisoformat(_pipeline_metrics["pipeline_start_time"])).total_seconds() / 3600, 1,
            ),
        },
        "recent_events": _pipeline_metrics["recent_events"][-30:],
        "last_engine_run": _pipeline_metrics.get("last_engine_run"),
    }
```

- [ ] **Step 2: Verify syntax**

```bash
cd backend && python3 -c "from app.api.v1.endpoints.ingestion import router; print('OK: ingestion module loads')"
```

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/endpoints/ingestion.py
git commit -m "feat: dynamic connector status from Composio in /ingestion/status"
```

---

### Task 4: Enhanced /sync Endpoint with Source Filter and Result Counts (A4 + B4 backend)

**Files:**
- Modify: `backend/app/api/v1/endpoints/ingestion.py:408-432`
- Modify: `backend/app/services/data_sync.py:263-295`

- [ ] **Step 1: Update background_sync to return results and track engine runs**

Replace the `background_sync` function in `data_sync.py` (line 284-295):

```python
# backend/app/services/data_sync.py — replace background_sync (line 284-295)

def background_sync(entity_id: str, user_hash: str, tenant_id: str, source: str = "all"):
    """Background task wrapper with own DB session. Stores results in pipeline metrics."""
    from app.api.v1.endpoints.ingestion import _pipeline_metrics
    try:
        with SessionLocal() as db:
            service = DataSyncService(db)
            if source == "github":
                result = asyncio.run(service.sync_github(entity_id, user_hash, tenant_id))
                results = {"github": result}
            elif source == "slack":
                result = asyncio.run(service.sync_slack(entity_id, user_hash, tenant_id))
                results = {"slack": result}
            elif source == "calendar":
                result = asyncio.run(service.sync_calendar(entity_id, user_hash, tenant_id))
                results = {"calendar": result}
            else:
                full = asyncio.run(service.sync_all_connected(entity_id, user_hash, tenant_id))
                results = full.get("sources", {})

        # Track ingested counts per source
        for src_name, src_result in results.items():
            count = src_result.get("ingested", 0)
            if count > 0:
                _pipeline_metrics["events_by_source"][src_name] = (
                    _pipeline_metrics["events_by_source"].get(src_name, 0) + count
                )
                _pipeline_metrics["total_ingested"] += count

        # Trigger engine recomputation
        from app.api.v1.endpoints.engines import run_all_engines
        run_all_engines(user_hash)

        # Record engine run result
        _pipeline_metrics["last_engine_run"] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_hash": user_hash[:8],
            "sources_synced": {k: v.get("ingested", 0) for k, v in results.items()},
        }

    except Exception as e:
        logger.error("Background sync failed for %s: %s", user_hash[:8], e)
```

- [ ] **Step 2: Update the /sync endpoint to pass source param**

```python
# backend/app/api/v1/endpoints/ingestion.py — replace /sync endpoint (line 408-432)

@router.post("/sync")
async def sync_connected_tools(
    source: str = Query(default="all", description="github, slack, calendar, or all"),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
    user=Depends(require_role("admin", "manager")),
):
    """Manually trigger data sync for connected tools."""
    from app.services.data_sync import background_sync

    settings = get_settings()
    identity = db.query(UserIdentity).filter_by(user_hash=user.user_hash).first()
    email = privacy.decrypt(identity.email_encrypted) if identity else ""
    entity_id = f"{email}-{settings.environment}" if email else ""

    if not entity_id:
        raise HTTPException(status_code=400, detail="Unable to resolve user identity for sync")

    background_tasks.add_task(
        background_sync, entity_id, user.user_hash, str(user.tenant_id), source
    )

    return {
        "success": True,
        "source": source,
        "message": f"Syncing {source} data in background. Check status for results.",
    }
```

- [ ] **Step 3: Verify**

```bash
cd backend && python3 -c "from app.api.v1.endpoints.ingestion import router; print('OK')"
```

- [ ] **Step 4: Commit**

```bash
cd backend
git add app/api/v1/endpoints/ingestion.py app/services/data_sync.py
git commit -m "feat: /sync endpoint supports source filter, tracks sync results"
```

---

### Task 5: Add Calendar Sync to DataSyncService (B2)

**Files:**
- Modify: `backend/app/services/data_sync.py`

- [ ] **Step 1: Add sync_calendar method**

Add this method to the `DataSyncService` class, after `sync_slack` (around line 261):

```python
# backend/app/services/data_sync.py — add to DataSyncService class

    async def sync_calendar(self, entity_id: str, user_hash: str,
                            tenant_id: Optional[str] = None, days: int = 14) -> dict:
        """Pull Google Calendar events via Composio and store as Events."""
        if not composio_client.is_available():
            return {"success": False, "error": "Composio not configured", "ingested": 0}

        ingested = 0
        errors = 0

        try:
            # Fetch calendar events
            time_min = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
            time_max = datetime.now(timezone.utc).isoformat()

            result = await composio_client.execute_tool(
                "googlecalendar", "list_events",
                {"timeMin": time_min, "timeMax": time_max, "maxResults": self._max_events_per_call},
                entity_id
            )

            if not result.get("success"):
                return {"success": False, "error": "Calendar fetch failed", "ingested": 0}

            events_data = []
            result_data = result.get("result", {})
            if isinstance(result_data, dict):
                data = result_data.get("data", result_data)
                if isinstance(data, dict):
                    events_data = data.get("items", [])
                elif isinstance(data, list):
                    events_data = data
            elif isinstance(result_data, list):
                events_data = result_data

            for cal_event in events_data:
                try:
                    # Extract start time
                    start = cal_event.get("start", {})
                    start_str = start.get("dateTime", start.get("date", ""))
                    if not start_str:
                        continue

                    try:
                        event_time = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
                    except ValueError:
                        continue

                    # Extract end time for duration
                    end = cal_event.get("end", {})
                    end_str = end.get("dateTime", end.get("date", ""))
                    duration_minutes = 30  # default
                    if end_str:
                        try:
                            end_time = datetime.fromisoformat(end_str.replace("Z", "+00:00"))
                            duration_minutes = max(1, int((end_time - event_time).total_seconds() / 60))
                        except ValueError:
                            pass

                    hour = event_time.hour
                    after_hours = hour >= 18 or hour < 8
                    attendee_count = len(cal_event.get("attendees", []))
                    event_id = cal_event.get("id", "")

                    # Dedup by source_id
                    if event_id:
                        existing = self.db.query(Event).filter(
                            Event.user_hash == user_hash,
                            Event.event_type == "meeting",
                        ).filter(
                            Event.metadata_["source_id"].astext == event_id
                        ).first()
                        if existing:
                            continue

                    event = Event(
                        user_hash=user_hash,
                        tenant_id=tenant_id,
                        timestamp=event_time,
                        event_type="meeting",
                        metadata_={
                            "duration_minutes": duration_minutes,
                            "attendee_count": attendee_count,
                            "after_hours": after_hours,
                            "is_recurring": bool(cal_event.get("recurringEventId")),
                            "source": "google_calendar",
                            "source_id": event_id,
                        },
                    )
                    self.db.add(event)
                    ingested += 1

                except Exception as e:
                    logger.debug("Failed to parse calendar event: %s", e)
                    errors += 1

            if ingested > 0:
                self.db.commit()

        except Exception as e:
            logger.error("sync_calendar failed: %s", e)
            self.db.rollback()
            return {"success": False, "error": str(e), "ingested": ingested, "errors": errors}

        return {
            "success": True,
            "source": "calendar",
            "ingested": ingested,
            "errors": errors,
        }
```

- [ ] **Step 2: Update sync_all_connected to include calendar**

In `sync_all_connected` (around line 263), add calendar sync after the Slack block:

```python
# Add after the Slack sync block (around line 273):
        if "googlecalendar" in connected_lower or "google_calendar" in connected_lower:
            results["calendar"] = await self.sync_calendar(entity_id, user_hash, tenant_id)
```

- [ ] **Step 3: Verify**

```bash
cd backend && python3 -c "
from app.services.data_sync import DataSyncService
assert hasattr(DataSyncService, 'sync_calendar'), 'sync_calendar missing'
print('OK: sync_calendar exists')
"
```

- [ ] **Step 4: Commit**

```bash
cd backend
git add app/services/data_sync.py
git commit -m "feat: add Calendar sync to DataSyncService via Composio"
```

---

### Task 6: GitHub Sync Creates GraphEdges for PR Reviews (B1)

**Files:**
- Modify: `backend/app/services/data_sync.py:95-137`

- [ ] **Step 1: Add GraphEdge creation after processing GitHub commits**

In `sync_github`, after the event is added to the session (around line 132), add GraphEdge creation for PR-related events. Add this inside the `for commit in commits:` loop, after `self.db.add(event)` and `ingested += 1`:

```python
                            # Create GraphEdge for PR reviews (reviewer -> author)
                            if normalized.event_type in ("pr_review", "code_review"):
                                author_email = commit_data.get("author_email", "")
                                if author_email and author_email != "unknown@unknown.com":
                                    author_hash = privacy.hash_identity(author_email)
                                    # Only create edge if both parties exist in this tenant
                                    if author_hash != user_hash:
                                        author_exists = self.db.query(UserIdentity).filter_by(
                                            user_hash=author_hash
                                        ).first()
                                        if author_exists:
                                            comment_len = normalized.metadata.get("comment_length", 100)
                                            weight = min(comment_len / 500, 1.0)  # normalize to 0-1
                                            # Upsert: update weight if edge exists
                                            existing_edge = self.db.query(GraphEdge).filter_by(
                                                source_hash=user_hash,
                                                target_hash=author_hash,
                                                edge_type="code_review",
                                            ).first()
                                            if existing_edge:
                                                existing_edge.weight = max(existing_edge.weight, weight)
                                                existing_edge.last_interaction = normalized.timestamp
                                            else:
                                                self.db.add(GraphEdge(
                                                    source_hash=user_hash,
                                                    target_hash=author_hash,
                                                    tenant_id=tenant_id,
                                                    weight=weight,
                                                    last_interaction=normalized.timestamp,
                                                    edge_type="code_review",
                                                ))
```

- [ ] **Step 2: Verify**

```bash
cd backend && python3 -c "
import inspect
from app.services.data_sync import DataSyncService
src = inspect.getsource(DataSyncService.sync_github)
assert 'GraphEdge' in src, 'GraphEdge not in sync_github'
assert 'code_review' in src, 'code_review edge type not in sync_github'
print('OK: sync_github creates GraphEdges')
"
```

- [ ] **Step 3: Commit**

```bash
cd backend
git add app/services/data_sync.py
git commit -m "feat: GitHub sync creates GraphEdges for PR reviews (feeds TalentScout)"
```

---

### Task 7: Frontend — Live Sync Feedback + Dynamic Connector Cards (A4, A5, B3, B4)

**Files:**
- Modify: `frontend/app/data-ingestion/page.tsx`

This is the largest frontend task. It combines A4 (live sync feedback), A5 (engine recomputation display), B3 (dynamic connector cards), and B4 (one-click connect & sync).

- [ ] **Step 1: Add syncing state with faster polling**

In `DataIngestionContent`, update the `handleSync` function and the polling interval:

```typescript
// frontend/app/data-ingestion/page.tsx

// Replace the handleSync callback (around line 123-134):
  const handleSync = useCallback(async (source: string) => {
    setSyncingSource(source)
    setSyncResult(null)
    try {
      const result = await syncConnectedTools(source)
      setSyncResult(`Sync started for ${source}. Watching for results...`)
      // Speed up polling during sync
      fetchStatus()
    } catch {
      setSyncResult("Sync failed. Please try again.")
    }
  }, [fetchStatus])

// Replace the polling useEffect (around line 136-140):
  useEffect(() => {
    fetchStatus()
    // Poll faster while syncing (2s), normal otherwise (10s)
    const interval = setInterval(fetchStatus, syncingSource ? 2000 : 10000)
    return () => clearInterval(interval)
  }, [fetchStatus, syncingSource])

  // Auto-clear syncing state when new events appear or engine runs
  useEffect(() => {
    if (syncingSource && status?.last_engine_run) {
      const runTime = new Date(status.last_engine_run.timestamp).getTime()
      const now = Date.now()
      if (now - runTime < 30000) { // engine ran within last 30s
        const sources = status.last_engine_run.sources_synced || {}
        const total = Object.values(sources).reduce((a: number, b: any) => a + (b as number), 0)
        setSyncResult(`Synced ${total} events. Engines recomputed.`)
        setTimeout(() => setSyncingSource(null), 3000)
      }
    }
  }, [status?.last_engine_run, syncingSource])
```

- [ ] **Step 2: Add PipelineStatus type for last_engine_run**

Update the `PipelineStatus` interface to include the new field:

```typescript
// Add to the PipelineStatus interface (around line 73-79):
interface PipelineStatus {
  mode: string
  connectors: ConnectorInfo[]
  pipeline_stages: PipelineStage[]
  metrics: PipelineMetrics
  recent_events: RecentEvent[]
  last_engine_run?: {
    timestamp: string
    user_hash: string
    sources_synced: Record<string, number>
  }
}
```

- [ ] **Step 3: Update connector cards to show Connect button with OAuth**

In the connector cards section of the JSX (where connectors are mapped), update each card to show a "Connect" button for not_configured connectors and a "Sync" button for connected ones. Add the connect handler:

```typescript
// Add this handler after the existing handleSync:
  const handleConnect = useCallback(async (connectorName: string) => {
    // Map connector names to Composio tool slugs
    const toolMap: Record<string, string> = {
      "Git": "github",
      "Slack": "slack",
      "Calendar": "googlecalendar",
    }
    const toolSlug = toolMap[connectorName]
    if (!toolSlug) return

    try {
      const { initiateConnection } = await import("@/lib/api")
      const result = await initiateConnection(toolSlug)
      if (result?.redirect_url) {
        // Open OAuth popup
        const popup = window.open(result.redirect_url, "Connect", "width=600,height=700")
        // Poll for connection completion
        const pollInterval = setInterval(async () => {
          if (popup?.closed) {
            clearInterval(pollInterval)
            // Refresh status to pick up new connection
            await fetchStatus()
            // Auto-trigger sync for newly connected tool
            handleSync(toolSlug)
          }
        }, 2000)
        // Timeout after 2 minutes
        setTimeout(() => clearInterval(pollInterval), 120000)
      }
    } catch (err) {
      setSyncResult(`Failed to connect ${connectorName}`)
    }
  }, [fetchStatus, handleSync])
```

- [ ] **Step 4: Update connector card JSX to use dynamic buttons**

In the connector card rendering, replace static status display with interactive buttons. Find the section where connectors are mapped (around line 358-416) and update each card's action area:

```tsx
{/* For each connector card, replace the status/action area: */}
{connector.name !== "CSV Upload" && connector.name !== "Jira" && (
  connector.status === "connected" ? (
    <Button
      size="sm"
      variant="outline"
      onClick={() => handleSync(connector.name === "Git" ? "github" : connector.name === "Slack" ? "slack" : "calendar")}
      disabled={syncingSource !== null}
      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
    >
      {syncingSource === (connector.name === "Git" ? "github" : connector.name.toLowerCase()) ? (
        <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Syncing...</>
      ) : (
        <><RefreshCw className="h-3 w-3 mr-1" /> Sync Now</>
      )}
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline"
      onClick={() => handleConnect(connector.name)}
      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
    >
      Connect
    </Button>
  )
)}
```

- [ ] **Step 5: Add engine recomputation feedback in pipeline stages**

After the pipeline stages section, add an engine run indicator:

```tsx
{/* Add after pipeline stages, before recent events */}
{status?.last_engine_run && (
  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    <span className="text-sm text-emerald-300">
      Engines recomputed
      {Object.keys(status.last_engine_run.sources_synced).length > 0 && (
        <> — {Object.entries(status.last_engine_run.sources_synced)
          .filter(([, v]) => (v as number) > 0)
          .map(([k, v]) => `${v} from ${k}`)
          .join(", ")}
        </>
      )}
    </span>
    <span className="text-xs text-slate-500 ml-auto">
      {new Date(status.last_engine_run.timestamp).toLocaleTimeString()}
    </span>
  </div>
)}
```

- [ ] **Step 6: Add sync result toast/banner**

Below the header section, add a sync result banner:

```tsx
{/* Add after the header section */}
{syncResult && (
  <div className={cn(
    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm animate-in fade-in slide-in-from-top-2",
    syncResult.includes("failed") || syncResult.includes("Failed")
      ? "bg-red-500/10 border border-red-500/20 text-red-400"
      : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
  )}>
    {syncResult.includes("failed") || syncResult.includes("Failed")
      ? <AlertCircle className="h-4 w-4" />
      : syncingSource
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <CheckCircle2 className="h-4 w-4" />
    }
    {syncResult}
  </div>
)}
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 8: Commit**

```bash
cd frontend
git add app/data-ingestion/page.tsx
git commit -m "feat: live sync feedback, dynamic connector cards, one-click connect & sync"
```

---

### Task 8: Final Integration Verification

- [ ] **Step 1: Start backend and verify /ingestion/status returns dynamic connector data**

```bash
cd backend && uv run uvicorn app.main:app --port 8000 &
sleep 3
# Test with auth token
TOKEN=$(curl -s -X POST "https://qucddukiwrlaqktxjlxb.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY ../frontend/.env | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"Demo123!"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

curl -s http://localhost:8000/api/v1/ingestion/status \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -30
```

Expected: connectors array with dynamic status values, `last_engine_run` field present.

- [ ] **Step 2: Test /sync with source filter**

```bash
curl -s -X POST "http://localhost:8000/api/v1/ingestion/sync?source=github" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

Expected: `{"success": true, "source": "github", "message": "..."}`

- [ ] **Step 3: Kill test backend**

```bash
kill %1 2>/dev/null
```

- [ ] **Step 4: Final commit with all changes**

```bash
cd backend && git add -A && git status
cd ../frontend && git add -A && git status
```

Verify no unexpected files are staged, then push both repos.
