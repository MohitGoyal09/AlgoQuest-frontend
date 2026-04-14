# Sentinel — End-to-End Pipeline

**How raw tool activity becomes actionable risk intelligence. Every step, every transformation, every decision point.**

---

## Pipeline Overview

```
                              DATA SOURCES
                                   |
        +-----------+--------------+--------------+-----------+
        |           |              |              |           |
   GitHub API   Slack API   Google Calendar   Gmail API
   (Composio)   (Composio)    (Composio)     (Composio)
        |           |              |              |
        v           v              v              v
   +---------+ +---------+  +---------+    +---------+
   | Commits | | Messages|  | Meetings|    | Emails  |
   | PRs     | | Replies |  | Duration|    | Replies |
   | Reviews | | Mentions|  | Time    |    | Timing  |
   +---------+ +---------+  +---------+    +---------+
        |           |              |              |
        +-----------+--------------+--------------+
                              |
                    IDENTITY HASHING (HMAC-SHA256)
                              |
                    email → user_hash (one-way)
                    email → email_encrypted (Fernet AES)
                              |
                 +------------+------------+
                 |                         |
           VAULT A (analytics)       VAULT B (identity)
           Events table              UserIdentity table
           - user_hash               - user_hash
           - event_type              - email_encrypted
           - timestamp               - name (encrypted)
           - metadata_ (JSON)        NO FK between vaults
                 |
                 v
         SCORING ENGINE (SafetyValve)
                 |
    +------------+------------+
    |            |            |
  Signal 1    Signal 2    Signal 3
  Velocity    Connection  Entropy
  (linregress) (reply/mention) (Shannon)
    |            |            |
    +------------+------------+
                 |
           RISK DECISION
           (convergent evidence)
                 |
      +----------+----------+
      |          |          |
   CRITICAL   ELEVATED    LOW
   (all 3)    (any 1)    (none)
      |          |          |
      +----------+----------+
                 |
           STORE + NOTIFY
           risk_scores → WebSocket → Dashboard
           risk_history → 30-day trend chart
           audit_log → compliance trail
```

---

## Step 1: Data Ingestion

### Sources and What We Extract

| Source | Tool | Event Type | Metadata We Capture | What We Never See |
|--------|------|------------|--------------------|--------------------|
| GitHub | Composio → `list_commits` | `commit` | timestamp, files_changed, additions, deletions, after_hours, sha | Code content, commit messages, file names |
| GitHub | Composio → PR events | `pr_review` | timestamp, comment_length, is_reply, mentions_others | Review text, PR descriptions |
| Slack | Composio → `search_messages` | `slack_message` | timestamp, channel, is_reply, reaction_count, mentions | Message text, DMs, attachments |
| Calendar | Composio → `list_events` | `meeting` | timestamp, duration_minutes, attendee_count, after_hours, is_recurring | Meeting agenda, notes, attendee names |
| Gmail | Composio → `list_messages` | `email_sent` | timestamp, recipient_count, is_reply, after_hours, message_id | Email subject, body, attachments |
| CSV | Manual upload | varies | timestamp, event_type, custom fields | depends on upload |

### Composio MCP Tool Router

```
User clicks "Connect GitHub" (or Slack, Calendar, Gmail) in Marketplace
    → OAuth popup via Composio
    → Token stored in Composio (not our DB)
    → entity_id = "{email}-{environment}" (e.g. "user@company.com-production")
    → Composio executes API calls on user's behalf
    → We receive metadata only
```

**Code reference:** `backend/app/services/data_sync.py` — `DataSyncService`

### Deduplication

Every ingested event carries a `source_id` in metadata (commit SHA, Slack message ts, Calendar event ID, Gmail message_id). Before inserting, we query:

```python
existing = db.query(Event).filter(
    Event.user_hash == user_hash,
    Event.event_type == event_type,
).filter(
    Event.metadata_["source_id"].astext == source_id
).first()
```

Duplicates are silently skipped. This makes sync operations idempotent.

---

## Step 2: Identity Hashing

Before any event is stored, the user's email is transformed:

```python
# One-way hash for analytics (can never recover email)
user_hash = HMAC-SHA256(email, salt=PRIVACY_SALT)

# Reversible encryption for identity vault (admin can recover with audit trail)
email_encrypted = Fernet(VAULT_KEY).encrypt(email.encode())
```

The `user_hash` appears in Vault A (analytics schema). The `email_encrypted` appears in Vault B (identity schema). There is **no foreign key** between them. Re-identification requires:
1. Admin role with `view_user_details` permission
2. Explicit vault lookup with audit log entry
3. 36-hour expiry on critical overrides

**Code reference:** `backend/app/core/security.py` — `PrivacyEngine`

---

## Step 3: Weighted Event Scoring

Not all events are equal. A commit touching 15 files with 200 lines changed carries more signal than a README typo fix.

### Formula

```python
# For code events (commits, PRs):
weight = min(files_changed * math.log1p(additions + deletions), 5.0)
score = max(0.5, weight)  # minimum 0.5 so events always count

# For non-code events (Slack messages, meetings):
score = 1.0  # flat base score

# Bonuses (applied to all event types):
if after_hours:      score += 2.0   # after 6pm or before 8am
if context_switches > 5: score += 0.5   # high task-switching day
```

### Why log1p?

`log1p(x)` = `ln(1 + x)`. This gives diminishing returns:
- 10 lines changed: log1p(10) = 2.4, score ~ 2.4
- 100 lines changed: log1p(100) = 4.6, score ~ 4.6
- 1000 lines changed: log1p(1000) = 6.9, capped at 5.0

A massive refactor isn't 100x more meaningful than a 10-line fix. It's maybe 2x.

### Why cap at 5.0?

Prevents a single massive commit from dominating the day's score. One person merging a vendor bundle shouldn't look like they had 50x the workload.

**Code reference:** `backend/app/services/safety_valve.py:289` — `_calculate_velocity()`

---

## Step 4: Three Signal Computation

All three signals are computed from the same 21-day event window, but measure completely different dimensions.

### Signal 1: Velocity (scipy.stats.linregress)

**What it asks:** Is this person's work intensity increasing over time?

```python
# Sum weighted daily scores over 21 days
daily_scores = {day: sum(weighted_scores) for day in window}

# Linear regression: is there an upward trend?
slope, _, r_value, _, _ = scipy.stats.linregress(days, scores)
velocity = slope        # positive = increasing intensity
r_squared = r_value**2  # 0-1, how well the data fits a line
```

**Why velocity of CHANGE matters:** A person who always works 10-hour days is fine. That's their baseline. A person who was working 6-hour days and is now working 12-hour days is drifting. We detect the delta, not the absolute.

### Signal 2: Connection Index (reply rate + mention frequency)

**What it asks:** Is this person socially connected to their team?

```python
interactions = [e for e in events if e.type in ("slack_message", "pr_comment", "pr_review")]
replies = count(e for e in interactions if e.metadata.is_reply)
mentions = count(e for e in interactions if e.metadata.mentions_others)
belongingness = (replies + mentions) / (2 * len(interactions))
# Range: 0.0 (isolated) to 1.0 (highly engaged)
```

**Why Connection Index beats sentiment:** Social withdrawal is a LEADING indicator. People stop replying and stop mentioning teammates 2-3 weeks BEFORE they say "I'm unhappy" in a survey. Connection Index catches the behavioral withdrawal pattern earlier than any NLP-based tool. And you can't fake it. People fake words ("I'm fine!"). You can't fake engagement patterns.

### Signal 3: Circadian Entropy (Shannon entropy)

**What it asks:** How chaotic is this person's schedule?

```python
hours = [event.timestamp.hour for event in events]
_, counts = np.unique(hours, return_counts=True)
probs = counts / len(hours)
entropy = -sum(p * np.log2(p) for p in probs)
# Range: 0.0 (all events same hour) to ~4.5 (spread across 24 hours)
```

**Why entropy detects burnout:** A healthy person works predictable hours. A burned-out person works at 2am, then 10am, then 11pm. The scatter IS the signal.

---

## Step 5: Multi-Source Confidence

Predictions built on data from only one source (e.g., only GitHub) are less reliable than predictions built on three sources (GitHub + Slack + Calendar).

### Formula

```python
# Count distinct data sources
sources = set()  # {"github", "slack", "calendar", "email"}
source_multiplier = min(source_count / 3.0, 1.0)

# Final confidence
confidence = r_squared * source_multiplier
```

| Sources Connected | Multiplier | Effect |
|-------------------|-----------|--------|
| 1 source | 0.33 | Confidence reduced by 67% |
| 2 sources | 0.67 | Confidence reduced by 33% |
| 3+ sources (4 available) | 1.0 | Full confidence |

**Why this matters:** If we only see GitHub data, we're guessing about the person's full work pattern. Maybe they're also having 5 Slack conversations an hour and their calendar is packed. With only one signal source, we should be less confident in our conclusions.

**Code reference:** `backend/app/services/safety_valve.py:158-176`

---

## Step 6: Risk Decision (Convergent Evidence)

This is the core decision logic. Three thresholds, two operators.

```python
if velocity > 2.5 AND belongingness < 0.3 AND entropy > 1.5:
    risk = "CRITICAL"
elif velocity > 1.5 OR belongingness < 0.4:
    risk = "ELEVATED"
else:
    risk = "LOW"
```

### Why CRITICAL Requires ALL THREE

| Scenario | velocity | belonging | entropy | Risk | Why |
|----------|---------|-----------|---------|------|-----|
| Hard sprint, happy team | 3.0 | 0.7 | 0.5 | ELEVATED | Busy but socially connected, regular schedule |
| Quiet period, withdrawing | 0.5 | 0.2 | 0.5 | ELEVATED | Low intensity but socially isolated |
| Night owl, chaotic hours | 1.0 | 0.6 | 2.5 | LOW | Chaotic schedule but low intensity, socially fine |
| All signals converge | 3.2 | 0.25 | 1.8 | CRITICAL | Intensity rising, withdrawing, schedule breaking |

**The principle:** One signal is noise. Two signals are a pattern. Three signals are an alarm. We would rather miss a true positive than create a false one.

### Attrition Probability

```python
raw = 0.4*velocity + 0.3*(1-belongingness) + 0.2*entropy + 0.1*sustained
probability = 1 / (1 + exp(-(raw * 3.5 - 2.5)))
```

| Risk Level | Typical Probability |
|-----------|-------------------|
| LOW | ~8% |
| ELEVATED | ~45% |
| CRITICAL | ~85% |

**Code reference:** `backend/app/services/safety_valve.py:184-189`

---

## Step 7: Storage and History

Every analysis run produces two writes:

1. **RiskScore** (current snapshot): `analytics.risk_scores` — latest velocity, confidence, belongingness, risk_level, attrition_probability
2. **RiskHistory** (time series): `analytics.risk_history` — same fields with timestamp, builds the 30-day trend chart

The frontend pulls RiskHistory to render the velocity trend chart. The line going up = increasing risk.

---

## Step 8: Notification Pipeline

```
Risk Decision
    |
    v
risk_level in (ELEVATED, CRITICAL)?
    |
    yes → NudgeDispatcher
    |       |
    |       v
    |    Employee sees nudge first:
    |    "Your connectivity has dropped this week"
    |       |
    |       v
    |    Manager sees risk card (if RBAC allows):
    |    "Jordan's behavioral pattern has changed"
    |       |
    |       v
    |    AI generates action plan:
    |    "Schedule 1:1, discuss workload, check deadline pressure"
    |
    v
WebSocket broadcast → connected dashboard clients update in real-time
```

**Employee-first design:** The employee always sees their own signals before the manager does. This is not surveillance. This is a mirror.

---

## Talent Scout Pipeline (Network Analysis)

Runs in parallel with Safety Valve. Different input, different math, different output.

```
GraphEdge table (who interacts with whom)
    |
    v
NetworkX DiGraph construction
    |
    +--- Betweenness Centrality: who bridges disconnected groups?
    |       betweenness = nx.betweenness_centrality(G, weight="weight")
    |
    +--- Eigenvector Centrality: who is connected to well-connected people?
    |       eigenvector = nx.eigenvector_centrality(G, weight="weight")
    |
    +--- Unblocking Count: whose work enables the most others?
    |       unblocking = G.out_degree(node, weight="weight")
    |
    v
Hidden Gem Detection:
    is_hidden_gem = betweenness > 0.3 AND eigenvector < 0.2 AND unblocking > 5
    (High bridge value + low visibility + high impact = hidden gem)
```

**Code reference:** `backend/app/services/talent_scout.py`

---

## Culture Thermometer Pipeline (Team Contagion)

Uses outputs from both Safety Valve and Talent Scout.

```
Team member list (from TenantMember)
    |
    +--- Aggregate RiskScores → avg_velocity, critical_count
    |
    +--- Graph Fragmentation → 1 - average_clustering(team_subgraph)
    |
    +--- Communication Decay → (interactions_last_7d - interactions_prev_7d) / prev_7d
    |
    v
Contagion Decision:
    if critical_count >= 2 AND fragmentation > 0.5:
        "HIGH_CONTAGION_RISK"    # Burnout is spreading
    elif avg_velocity > 1.5:
        "ELEVATED"
    else:
        "STABLE"
```

**SIR Epidemic Model:** Burnout behaves like a virus. When one person burns out, their teammates absorb the workload, increasing their own risk. R0 > 1.0 means burnout is spreading faster than recovery.

**Code reference:** `backend/app/services/culture_temp.py`

---

## Shadow Deployment (Accuracy Validation)

We don't claim accuracy yet. We built the infrastructure to measure it.

```
POST /api/v1/shadow/actual-departure
    Body: { user_hash, departure_date, reason }
    |
    v
Look up: what did Sentinel predict for this person?
    → RiskScore.risk_level, RiskScore.attrition_probability
    |
    v
Compare: predicted_risk in (CRITICAL, ELEVATED) → correctly_predicted = true
    |
    v
Log to audit trail with full comparison details
    |
    v
GET /api/v1/shadow/stats
    → { total_departures, correctly_predicted, false_negatives, accuracy }
```

After 6 months of shadow deployment, we'll have real accuracy numbers. Until then, we're honest: "The math is sound, the architecture is complete, the validation is in progress."

**Code reference:** `backend/app/api/v1/endpoints/shadow.py`

---

## Context-Aware Filtering

Not all late nights are burnout. Some are hackathons, deadlines, or timezone differences.

```python
# ContextEnricher checks Google Calendar for explanations
events = context.mark_events_explained(events, user_email)

# Only unexplained events count toward velocity
unexplained_events = [e for e in events if not e.metadata_.get("explained", False)]
velocity, r_squared = _calculate_velocity(unexplained_events)
```

If a person has a calendar event during their late-night commits, those commits don't count toward their burnout velocity. The system can distinguish between "chose to work late" and "forced to work late."

**Code reference:** `backend/app/services/context.py` — `ContextEnricher`

---

## What Makes This Pipeline Different

| Dimension | Sentinel | Traditional Tools |
|-----------|---------|-------------------|
| Input | Metadata only (timestamps, counts, frequencies) | Content (email text, survey responses, 1:1 notes) |
| Participation | Zero (passive observation) | Required (fill surveys, write reviews) |
| Privacy | Two-vault architecture, HMAC hashing, no FK between vaults | Single database, often stores full content |
| False positive control | Three-signal convergence + personal baselines | Single-signal thresholds + company benchmarks |
| Accuracy validation | Shadow deployment framework (honest: no numbers yet) | Historical ML training (Qualtrics: 73%) |
| Gaming resistance | Weighted scoring + 21-day sustained requirement | Survey psychometrics, HRIS triangulation |

---

## Quick Reference: Key Numbers

| Parameter | Value | Why |
|-----------|-------|-----|
| Baseline window | 21 days | Long enough for stable trend, short enough for timely detection |
| Minimum events | 14 | Below this, insufficient data for reliable regression |
| CRITICAL velocity | > 2.5 | ~2.5x increase in work intensity over baseline |
| CRITICAL connection | < 0.3 | Bottom 30% of social engagement |
| CRITICAL entropy | > 1.5 | Schedule spread across ~3x normal hour range |
| Weighted score cap | 5.0 | Prevents single massive event from dominating |
| Source confidence min | 0.33 | Single-source predictions heavily penalized |
| Sources available | 4 | GitHub, Slack, Calendar, Gmail — 3+ needed for full confidence |
| Attrition probability range | 8% to 85% | Calibrated via sigmoid, not ML-trained |
| History retention | 30 days | Rolling window for trend visualization |
