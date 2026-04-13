# Sentinel — Scoring & Risk Classification

**How metadata becomes risk scores. Every formula, every threshold, every decision.**

## The Pipeline

```
Raw Event (commit at 11pm)
    ↓
Daily Score: base 1.0 + after_hours bonus 2.0 + context_switches bonus 0.5
    ↓
21 days of daily scores collected
    ↓
scipy.stats.linregress(days, scores) → slope = velocity, r² = confidence
    ↓
Three signals computed simultaneously:
    velocity (is work intensity increasing?)
    belongingness (is social engagement declining?)
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

Think of it like a smoke detector. It doesn't know what's burning. It detects environmental change. Sentinel detects behavioral change.

## Signal 1: Velocity (scipy.stats.linregress)

**What it measures:** The rate of change in work intensity over 21 days.

```python
# For each day, sum activity scores
daily_score = sum(
    1.0                              # base per event
    + (2.0 if after_hours else 0)    # after 6pm or before 8am
    + (0.5 if context_switches > 5)  # high task-switching
    for event in day_events
)

# Linear regression over 21 daily totals
slope, _, r_value, _, _ = scipy.stats.linregress(days, daily_scores)
velocity = slope        # positive = increasing intensity
confidence = r_value**2  # 0-1, how well the trend fits
```

**Example:** Jordan Lee has daily scores trending from 8 to 22 over 3 weeks. linregress gives slope=3.2, R-squared=0.91. That means work intensity is increasing at 3.2 points/day with 91% confidence.

**Why it works:** We don't flag absolute intensity. A person who always works hard is fine. We flag the CHANGE.

**Implementation:** `backend/app/services/safety_valve.py` — `_calculate_velocity()`

## Signal 2: Belongingness (reply rate + mention rate)

**What it measures:** Social engagement via communication patterns.

```python
interactions = [e for e in events if e.type in ("slack_message", "pr_comment", "pr_review")]
replies = count(e for e in interactions if e.metadata.is_reply)
mentions = count(e for e in interactions if e.metadata.mentions_others)
belongingness = (replies + mentions) / (2 * len(interactions))
# Range: 0.0 (completely isolated) to 1.0 (highly engaged)
```

**Example:**
- Maria Santos: replies 75%, mentions 75% = belongingness 0.75 (healthy)
- Jordan Lee: stopped replying in week 2, 10% reply rate = belongingness 0.25 (withdrawing)

**Implementation:** `backend/app/services/safety_valve.py` — `_calculate_belongingness()`

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
| CRITICAL | velocity > 2.5 AND belonging < 0.3 AND entropy > 1.5 | All three signals fire simultaneously |
| ELEVATED | velocity > 1.5 OR belonging < 0.4 | Any one signal trips |
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

## What We Don't Claim

- No prediction accuracy percentage. R-squared is trend confidence, not prediction accuracy.
- Thresholds (2.5, 0.3, 1.5) are hypotheses, not validated.
- Next step: 6-month shadow deployment for precision/recall validation.
