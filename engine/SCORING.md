# Sentinel — Scoring & Risk Classification

**How metadata becomes risk scores. Every formula, every threshold, every decision.**

For the complete end-to-end pipeline (ingestion → hashing → scoring → notification), see [PIPELINE.md](PIPELINE.md).

## The Pipeline

```
Raw Event (commit at 11pm, 15 files, 200 lines)
    ↓
Weighted Score: min(files_changed * log1p(additions + deletions), 5.0)
    + after_hours bonus 2.0 + context_switches bonus 0.5
    ↓
Context Filter: calendar check → explained events removed
    ↓
21 days of weighted daily scores collected
    ↓
scipy.stats.linregress(days, scores) → slope = velocity, r² = trend confidence
    ↓
Multi-source confidence: r² * min(source_count / 3.0, 1.0)
    ↓
Three signals computed simultaneously:
    velocity (is work intensity increasing?)
    connection index (is social engagement declining?)
    entropy (is schedule becoming chaotic?)
    ↓
Risk decision (ALL THREE must match for CRITICAL)
```

## What We Ingest (Metadata Only)

| Source | What We See | What We Never See |
|--------|------------|-------------------|
| GitHub | Commit timestamps, file counts, PR review frequency | Code content, PR descriptions, commit messages |
| Slack | Reply patterns, reaction counts, channel activity times | Message text, DMs, file attachments |
| Calendar | Meeting duration, attendee count, time of day | Meeting agenda, notes, attendee names |
| Gmail | Email timestamps, recipient counts, reply patterns | Email subject, body, attachments |

Think of it like a smoke detector. It doesn't know what's burning. It detects environmental change. Sentinel detects behavioral change.

## Signal 1: Velocity (scipy.stats.linregress)

**What it measures:** The rate of change in work intensity over 21 days.

```python
# For each event, calculate a weighted score based on complexity
metadata = event.metadata_
files = metadata.get("files_changed", 1)
additions = metadata.get("additions", 0)
deletions = metadata.get("deletions", 0)
changes = additions + deletions

# Code events get weighted by complexity (log scale, capped)
if files > 0 and changes > 0:
    weight = min(files * math.log1p(changes), 5.0)  # cap at 5.0
    score = max(0.5, weight)                          # minimum 0.5
else:
    score = 1.0  # non-code events (Slack, meetings)

# Bonuses
if metadata.get("after_hours"):    score += 2.0  # after 6pm or before 8am
if metadata.get("context_switches", 0) > 5: score += 0.5  # high task-switching

# Sum per day, then regress over 21 days
slope, _, r_value, _, _ = scipy.stats.linregress(days, daily_scores)
velocity = slope        # positive = increasing intensity
r_squared = r_value**2  # 0-1, how well the trend fits
```

**Example:** Jordan Lee has daily scores trending from 8 to 22 over 3 weeks. linregress gives slope=3.2, R-squared=0.91. That means work intensity is increasing at 3.2 points/day with 91% trend confidence.

**Why weighted?** A README typo fix (1 file, 2 lines → score 0.5) shouldn't count the same as a 15-file refactor (15 files, 200 lines → score 4.6). log1p gives diminishing returns so a 10,000-line vendor dump doesn't dominate.

**Why it works:** We don't flag absolute intensity. A person who always works hard is fine. We flag the CHANGE.

**Implementation:** `backend/app/services/safety_valve.py` — `_calculate_velocity()`

## Multi-Source Confidence Multiplier

R-squared alone isn't enough. A perfect trend line from only GitHub data is less trustworthy than a noisy signal from GitHub + Slack + Calendar combined.

```python
# Count distinct data sources across all events
sources = set()  # e.g. {"github", "slack", "calendar", "email"}
# Inferred from event_type: commit→github, slack_message→slack, meeting→calendar, email_sent→email
# Also from metadata_.source field

source_count = len(sources)
source_multiplier = min(source_count / 3.0, 1.0)

# Final confidence score
confidence = r_squared * source_multiplier
```

| Sources | Multiplier | Example |
|---------|-----------|---------|
| 1 (GitHub only) | 0.33 | R²=0.91 → confidence=0.30 |
| 2 (GitHub + Slack) | 0.67 | R²=0.91 → confidence=0.61 |
| 3+ (GitHub + Slack + Calendar + Gmail) | 1.0 | R²=0.91 → confidence=0.91 |

**Why this matters:** An employee who only uses GitHub might appear to have declining activity, but if we can't see their Slack and Calendar, maybe they're in meetings all day. More sources = more complete picture = higher confidence.

**Implementation:** `backend/app/services/safety_valve.py` — lines 158-176

## Signal 2: Connection Index (reply rate + mention rate)

**What it measures:** Social engagement via communication patterns. This is Sentinel's answer to the PS's "sentiment analysis" requirement. Instead of reading what people SAY (easy to fake), we measure what people DO (impossible to fake).

**Why "Connection Index" and not "Sentiment":** Social withdrawal is a LEADING indicator of burnout. People stop replying and stop mentioning teammates 2-3 weeks BEFORE they verbalize unhappiness in a survey. Connection Index catches the behavioral withdrawal pattern earlier than any NLP-based sentiment tool.

```python
interactions = [e for e in events if e.type in ("slack_message", "pr_comment", "pr_review", "email_sent")]
replies = count(e for e in interactions if e.metadata.is_reply)         # includes email replies
mentions = count(e for e in interactions if e.metadata.mentions_others)  # includes multi-recipient emails
connection_index = (replies + mentions) / (2 * len(interactions))
# Range: 0.0 (completely isolated) to 1.0 (highly engaged)
```

**Example:**
- Maria Santos: replies 75%, mentions 75% = connection index 0.75 (healthy, well-connected)
- Jordan Lee: stopped replying in week 2, 10% reply rate = connection index 0.25 (withdrawing)

`email_sent` events feed into Connection Index: `is_reply` contributes to reply rate, and multi-recipient emails (`recipient_count > 1`) contribute to `mentions_others`. This is especially important for non-engineering roles (sales, HR) where email is the primary communication channel.

**Implementation:** `backend/app/services/safety_valve.py` — `_calculate_belongingness()` (API field name is `belongingness_score` for backward compatibility)

## Signal 3: Circadian Entropy (Shannon entropy, 1948)

**What it measures:** Schedule chaos. How scattered are work hours?

```python
hours = [event.timestamp.hour for event in events]
_, counts = np.unique(hours, return_counts=True)
probs = counts / len(hours)
entropy = -sum(p * np.log2(p) for p in probs)
# Range: 0.0 (all same hour) to ~4.5 (spread across all 24 hours)
```

**Example:**
- Maria works 9-5 consistently. Entropy ~0.5 (regular).
- Jordan works at 2am, 10am, 11pm, 7am. Entropy ~2.0 (chaotic).

**Implementation:** `backend/app/services/safety_valve.py` — `_calculate_entropy()`

## Risk Decision

```python
if velocity > 2.5 and belongingness < 0.3 and entropy > 1.5:
    risk = "CRITICAL"
elif velocity > 1.5 or belongingness < 0.4:
    risk = "ELEVATED"
else:
    risk = "LOW"
```

| Level | Condition | Meaning |
|-------|-----------|---------|
| CRITICAL | velocity > 2.5 AND connection < 0.3 AND entropy > 1.5 | All three signals fire simultaneously |
| ELEVATED | velocity > 1.5 OR connection < 0.4 | Any one signal trips |
| LOW | Everything else | All signals within healthy range |

## Why One Signal Isn't Enough

A person who works late but is socially active and has a regular schedule is probably just busy. A person who stopped replying on Slack but works normal hours might be in deep focus. Only when intensity rises AND social connection drops AND schedule becomes chaotic do we flag CRITICAL.

## Real Example: Jordan Lee's Progression

```
Week 1: velocity 1.5, belonging 0.55, entropy 0.8  → LOW
Week 2: velocity 2.0, belonging 0.40, entropy 1.2  → ELEVATED (velocity > 1.5)
Week 3: velocity 2.8, belonging 0.30, entropy 1.6  → ELEVATED (two signals)
Week 4: velocity 3.2, belonging 0.25, entropy 1.8  → CRITICAL (all three)
```

## The Key Insight

We measure velocity of CHANGE from personal baselines. A night owl at midnight is never flagged. A day worker suddenly at midnight IS flagged.

## Talent Scout: Network Centrality (NetworkX)

```python
betweenness = networkx.betweenness_centrality(G, weight="weight")
eigenvector = networkx.eigenvector_centrality(G, weight="weight")
unblocking = G.out_degree(node, weight="weight")

is_hidden_gem = betweenness > 0.3 and eigenvector < 0.2 and unblocking > 5
```

Emma Thompson: betweenness 0.85, eigenvector 0.15, unblocking 22. Bridges Engineering and Design. Invisible to traditional metrics.

## Culture Thermometer: SIR Epidemic Model

```python
dS/dt = -beta * S * I / N
dI/dt = beta * S * I / N - gamma * I
dR/dt = gamma * I

R0 = beta / gamma  # > 1.0 means burnout is spreading
```

## Attrition Probability

```python
raw = 0.4*velocity + 0.3*(1-belongingness) + 0.2*entropy + 0.1*sustained
probability = sigmoid(raw * 3.5 - 2.5)
# Healthy → ~8%, Elevated → ~45%, Critical → ~85%
```

## Context-Aware Filtering

Not all late nights are burnout. Before calculating velocity, we filter explained events:

```python
# ContextEnricher checks Google Calendar for concurrent events
events = context.mark_events_explained(events, user_email)

# Only UNEXPLAINED events count toward velocity
unexplained_events = [e for e in events if not e.metadata_.get("explained", False)]
velocity = _calculate_velocity(unexplained_events)  # filtered
belongingness = _calculate_belongingness(all_events)  # unfiltered (social is always relevant)
```

If a person has a calendar event during their late-night commits (hackathon, on-call rotation, timezone meeting), those commits don't inflate their burnout velocity.

**Implementation:** `backend/app/services/context.py` — `ContextEnricher`

## Shadow Deployment (Accuracy Validation)

We built the infrastructure to measure prediction accuracy against real outcomes.

```python
# Admin logs an actual departure
POST /api/v1/shadow/actual-departure
    { "user_hash": "abc123", "departure_date": "2026-04-15", "reason": "voluntary" }

# System compares against its prediction
predicted_risk = RiskScore.risk_level        # what Sentinel said
predicted_attrition = RiskScore.attrition_probability
correctly_predicted = predicted_risk in ("CRITICAL", "ELEVATED")

# Logged to audit trail for retrospective analysis
GET /api/v1/shadow/stats
    → { total_departures, correctly_predicted, false_negatives, accuracy }
```

After 6 months of shadow deployment alongside existing HR tools, we'll have precision/recall numbers. This is the honest path to validated accuracy.

**Implementation:** `backend/app/api/v1/endpoints/shadow.py`

## What We Don't Claim

- No prediction accuracy percentage yet. R-squared is trend confidence, not prediction accuracy.
- Thresholds (2.5, 0.3, 1.5) are hypotheses calibrated against burnout research, not validated on production data.
- Shadow deployment framework is built and ready. Accuracy numbers require 6+ months of real-world data.
- Attrition probabilities (8%/45%/85%) are sigmoid-calibrated heuristics, not ML-trained models.
