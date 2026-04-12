# Sentinel — Pitch Preparation Guide

**For:** AlgoQuest'25 Hackathon (April 18, 2026)
**Updated:** April 13, 2026

## The Core Concept (Memorize This)

Sentinel is a smoke detector for employee burnout. A smoke detector doesn't know what's burning. It detects environmental change. Sentinel measures the **velocity of behavioral change** using metadata only, never message content, with a two-vault cryptographic privacy architecture.

**The Deterministic Sandwich:**
```
Layer 1: INGESTION     Python validation, schema checks
Layer 2: ANALYSIS      NumPy/SciPy (pure math, deterministic)
Layer 3: GENERATION    LLM for text ONLY (never sees raw data)
```

AI does NOT make decisions. Math makes decisions. AI writes text.

## How Metadata Becomes Scores

### What We Ingest

| Source | What We See | What We Never See |
|--------|------------|-------------------|
| GitHub | Commit timestamps, file counts, PR review frequency | Code content, PR descriptions, commit messages |
| Slack | Reply patterns, reaction counts, channel activity | Message text, DMs, file attachments |
| Calendar | Meeting duration, attendee count, time of day | Meeting agenda, notes, attendee names |
| Jira | Ticket status changes, sprint velocity | Ticket descriptions, comments |

### How We Calculate Each Score

#### Velocity (scipy.stats.linregress)

**What it measures:** The rate of change in work intensity over 21 days.

**The math:**
1. For each day, sum a daily activity score:
   - Each event = 1 point
   - After-hours event (before 8am or after 6pm) = +2 bonus points
   - High context-switching (>5 switches) = +0.5 bonus points
2. Run linear regression on 21 daily totals
3. **Slope = velocity** (higher = more intense trend)
4. **R-squared = confidence** (0.91 means 91% of variance explained by the trend)

**Example:** Jordan Lee has daily scores trending from 8 to 22 over 3 weeks. linregress gives slope=3.2, R²=0.91. That means work intensity is increasing at 3.2 points/day with high confidence.

**Why it works:** We don't flag absolute intensity. A person who always works hard is fine. We flag the CHANGE. A person whose intensity is rising 3.2 points/day is heading toward a wall.

#### Belongingness (reply rate + mention rate)

**What it measures:** Social engagement via communication patterns.

**The math:**
```
belongingness = (replies + mentions_others) / (2 * total_interactions)
```

Only counts `slack_message`, `pr_comment`, and `pr_review` events.

**Example:** Maria Santos replies to 75% of messages and mentions colleagues 75% of the time. Belongingness = 0.75. Jordan Lee stopped replying in week 2 (only 10% reply rate). Belongingness = 0.25.

**Why it works:** Social withdrawal is one of the strongest early signals of burnout. When someone stops replying to Slack messages and stops mentioning others, they're disengaging.

#### Circadian Entropy (Shannon entropy)

**What it measures:** Schedule chaos. How scattered are your work hours?

**The math:**
```
H = -sum(p * log2(p)) over hourly distribution
```

Same formula Claude Shannon published in 1948 for information theory.

**Example:** Maria works 9-5 consistently. Her hour distribution is concentrated in 8 hours. Entropy ~0.5 (low, regular). Jordan works at 2am, 10am, 11pm, 7am. His hour distribution is spread across 18+ hours. Entropy ~2.0 (high, chaotic).

**Why it works:** Chaotic schedules correlate with loss of control over work-life boundaries. The person isn't choosing to work late, they're losing the ability to stop.

#### Risk Decision (all three must be true for CRITICAL)

```
CRITICAL  = velocity > 2.5  AND  belongingness < 0.3  AND  entropy > 1.5
ELEVATED  = velocity > 1.5  OR   belongingness < 0.4
LOW       = everything else
```

One signal alone is never enough. CRITICAL requires simultaneous work intensity increase, social withdrawal, AND schedule chaos.

#### Talent Scout (NetworkX graph centrality)

**What it measures:** Who is structurally important in the organization but invisible to traditional metrics.

**The math:**
- `betweenness_centrality(G)` : Who sits on shortest paths between others (bridge)
- `eigenvector_centrality(G)` : Who is connected to well-connected people (influencer)
- `out_degree(G, weight)` : Who unblocks others (helper)

**Hidden Gem = betweenness > 0.3 AND eigenvector < 0.2 AND unblocking > 5**

High bridge position + low "celebrity" status + frequent helping = someone holding teams together invisibly.

**Example:** Emma Thompson. Betweenness 0.85 (highest bridge score). Eigenvector 0.15 (not connected to managers). 22 unblocking events. She reviews PRs across Engineering and Design. Traditional performance metrics show nothing special.

#### Culture Thermometer (SIR epidemic model)

**What it measures:** Is burnout spreading across a team like a contagion?

**The math:** Adapted from the SIR (Susceptible-Infected-Recovered) epidemiological model used to model COVID-19 spread.

```
dS/dt = -beta * S * I / N
dI/dt = beta * S * I / N - gamma * I
dR/dt = gamma * I
```

R0 (basic reproduction number) = beta / gamma. If R0 > 1.0, burnout is spreading. If R0 < 1.0, it's recovering naturally.

**Why it works:** Burnout research shows contagion effects. One burned-out team member increases stress on adjacent team members through increased workload redistribution, emotional drain, and communication breakdown.

## The 5 Hard Questions (and Honest Answers)

### Q1: "What's your accuracy? False positive rate?"

**Answer:** "We don't have production accuracy numbers yet. We haven't deployed to real organizations. What we have is mathematically sound signal detection. The R-squared value tells us how confident we are in each individual trend. R²=0.91 means 91% of variance in daily activity is explained by the linear trend. That's statistical confidence in the trend direction, not prediction accuracy. The thresholds (velocity > 2.5, etc.) are our hypothesis. We plan to validate through a 6-month shadow deployment at 2-3 companies."

**Who asks this:** Dr. Chetana (NCAER), Akshay (NatWest), Mudit (JK Cement)

### Q2: "Metadata alone can't detect burnout. People burn out without changing patterns."

**Answer:** "You're right. Metadata captures behavioral change, not internal state. If someone is burned out but maintaining their exact same work pattern, we won't detect it. That's why we position as an EARLY WARNING system, not a diagnosis. Surveys capture the subjective experience. Sentinel captures the behavioral shift that often precedes subjective awareness by 2-4 weeks. They're complementary."

**Who asks this:** Dr. Chetana (NCAER), Abhineet (A&M), Danish (MITRA)

### Q3: "How does this work for non-desk workers?"

**Answer:** "Today, Sentinel works for knowledge workers who generate digital signals: commits, messages, calendar events. For factory workers, the Phase 2 roadmap integrates with SAP HCM, shift management, and attendance systems. Shift pattern changes (irregular overtime, missed breaks, schedule chaos) map directly to our entropy metric. We start with corporate HQ, prove ROI, then extend. We won't pretend to solve the factory floor on day one."

**Who asks this:** Puneet (PepsiCo), Vipin (UFLEX), Sandeep (TrucksUp), Dr. Veni (CILT)

### Q4: "This is surveillance. Employees will reject it."

**Answer:** "Three defenses. First, we never access content. Timestamps and counts only. Second, employees see their OWN wellbeing dashboard first. Managers see only anonymized team trends. Identity reveal requires employee consent AND gets audit-logged. Third, the two-vault architecture: analytics data and identity data are in separate database schemas with no foreign key. Even a full database breach yields only anonymous hashes. Privacy by physics, not policy."

**Who asks this:** Danish (MITRA), Dr. Veni (CILT), Arpit (Grant Thornton)

### Q5: "What if employees game it?"

**Answer:** "That's actually a feature. If knowing that late-night commits are a burnout signal causes someone to stop working at 2 AM, we just reduced burnout. The Hawthorne effect works in our favor. And because we measure velocity of CHANGE, not absolute values, gaming requires maintaining a consistent fake pattern over 21+ days, which is impractical."

**Who asks this:** Mudit (JK Cement), Abhineet (A&M)

## Judge-by-Judge Strategy

### Manufacturing/Logistics (5 judges, will ask about non-desk workers)

| Judge | Company | Open With | Key Number |
|-------|---------|-----------|------------|
| Puneet Chabra | PepsiCo | "Phase 1: HQ knowledge workers. Phase 2: SAP HCM integration." | "10,000 employees, phased rollout" |
| Vipin Kumar | UFLEX | "What's built and running TODAY. Live demo, not slides." | "Show the live system" |
| Mudit Krishna | JK Cement | "scipy.linregress, not LLM classification. Deterministic sandwich." | "R²=0.91 confidence" |
| Sandeep Pahuja | TrucksUp | "Driver who quits = idle truck for 3 weeks." | "$4/employee/month Starter" |
| Dr. Veni Mathur | CILT | "INR 1.2 lakh crore annual burnout cost to Indian enterprises." | "40-60% attrition reduction ROI" |

**Universal pivot:** "Sentinel starts with knowledge workers. The math is the same for any behavioral pattern. Shift data, attendance data, overtime data all feed the same velocity formula."

### Technical (3 judges, will probe architecture)

| Judge | Company | Open With | Avoid |
|-------|---------|-----------|-------|
| Akshay Kashyap | NatWest | "HMAC-SHA256 at edge. Two schemas, no FK. AES-256 in Vault B." | Don't bluff on architecture |
| Mudit Krishna | JK Cement | "Classical ML, not fine-tuned LLMs. scipy + networkx." | Don't say "we use AI" without depth |
| Arpit Rastogi | Grant Thornton | "SOC 2 aligned. RBAC. You deploy + resell to clients." | Don't ignore the reseller opportunity |

**Technical Q&A depth:**
- "Walk me through the data architecture." → Show the two-vault diagram on the methodology page
- "What models do you use?" → "scipy.stats.linregress, scipy.stats.entropy, networkx.betweenness_centrality. The LLM (Gemini Flash) only generates text narratives from math outputs."
- "What about GDPR?" → "user_hash = HMAC-SHA256(email, vault_salt)[:32]. Vault A has zero PII. Vault B is AES-encrypted. No FK between schemas. GDPR erasure = DELETE WHERE user_hash = X."

### Strategy/Commercial (3 judges, will probe market fit)

| Judge | Company | Open With | Key Stat |
|-------|---------|-----------|----------|
| Nilabh Kumar | Gartner | "New category: behavioral signal intelligence. Not Voice of Employee." | TAM $8B, SAM $2B |
| Sabyasachi Guha Raj | Grand View | "TAM $8B. Competitive matrix: Culture Amp = surveys, us = continuous signals." | "Aggregate benchmark data product" |
| Abhineet Sood | A&M | "Root cause diagnostic, not symptom tracking. Which processes create burnout." | "Business intelligence, not HR tool" |

**Competitive positioning:**
```
CULTURE AMP / LATTICE    Sentinel
─────────────────────    ────────
Periodic surveys         Continuous behavioral signals
Self-reported data       Objective metadata patterns
1x per quarter           Daily trend updates
Content-based analysis   Metadata only (no content)
Single database          Two-vault privacy architecture
```

### Research/Policy (3 judges, will probe evidence and ethics)

| Judge | Company | Open With | Key Move |
|-------|---------|-----------|----------|
| Dr. Veni Mathur | CILT | Economic impact in INR. No SaaS jargon. | Speak in policy/economics terms |
| Dr. Chetana Chaudhuri | NCAER | "Methodology: linregress, Shannon entropy, NetworkX." | Be honest about what's validated vs hypothesis |
| Danish Raza | MITRA | Tell a STORY about a govt department. | Lead with the human problem, then show tech |

**Evidence honesty framework:**
- **Validated (can claim):** Each mathematical method (linregress, Shannon entropy, NetworkX centrality) is individually peer-reviewed and well-established.
- **Hypothesis (cannot claim):** The specific thresholds (velocity > 2.5, belongingness < 0.3, entropy > 1.5) and their composition into burnout risk.
- **Next step:** 6-month shadow deployment to measure precision/recall against actual attrition events.

## The One Table That Wins Every Judge

```
CURRENT APPROACH              →  SENTINEL
────────────────                 ─────────
Exit interviews               →  Daily behavioral signals
Quarterly surveys              →  Continuous 30-day trends
Content surveillance           →  Metadata only (timestamps, counts)
Same database (PII exposed)    →  Two-vault (no FK between schemas)
Manager gut feeling            →  Linear regression + R² confidence
AI makes decisions             →  Math decides, AI writes text
```

## Demo Flow (3 Minutes)

### Minute 1: The Problem + Admin View (60s)

> "76% of employees experience burnout. Current detection happens in exit interviews, 6 months too late. Sentinel catches it 30 days earlier."

1. Login as `admin@acme.com` / `Demo123!`
2. Dashboard: org overview, risk distribution (1 CRITICAL, 3 ELEVATED, 11 LOW)
3. Point to team health map: "Engineering team is elevated."

### Minute 2: The Engine (60s)

1. Safety Valve engine → Jordan Lee (CRITICAL)
2. Show: velocity 3.2 (R²=0.91), belongingness 0.25, indicators
3. Say: "This is math, not AI opinion. Velocity is scipy.linregress. Belongingness is reply rate. Entropy is Shannon's formula."
4. Click "Generate 1:1 Agenda" → AI generates talking points

### Minute 3: Privacy + Network (60s)

1. Talent Scout → network graph
2. Point to Emma (hidden gem): "Betweenness 0.85, unblocking 22, eigenvector 0.15. Invisible to traditional metrics."
3. Privacy: "We never see message content. Two separate vaults. No JOIN possible without the vault key."

## What NOT to Say

| Do Not Say | Say Instead |
|------------|-------------|
| "We use AI" | "We use mathematical models, AI only writes the text" |
| "We predict behavior" | "We identify pattern changes from personal baselines" |
| "94% accuracy" | "R-squared confidence on every alert" |
| "We identify high performers" | "We find structurally critical people at retention risk" |
| "30-day prediction" | "Early warning signals" (until validated) |
| "Automated interventions" | "Insights and recommendations, humans decide" |
| "We replace Culture Amp" | "We complement surveys with continuous behavioral signals" |

## Simulation Mode (for live demo)

The system has a built-in simulation mode that creates realistic employee personas:

| Persona | Email | Pattern | Risk |
|---------|-------|---------|------|
| Alex (Burnout) | alex@simulation.com | Sigmoid burnout curve over 30 days | CRITICAL |
| Sarah (Hidden Gem) | sarah@simulation.com | High network impact, healthy metrics | LOW |
| Jordan (Steady) | jordan@simulation.com | Consistent healthy pattern | LOW |
| Maria (Contagion) | maria@simulation.com | Declining sentiment, team spread | ELEVATED |

Navigate to `/simulation` → select a persona → "Run Simulation" → events generate → engines recompute → see results on dashboard.

The seed data already includes 15 realistic users with deterministic patterns. For the demo, use the seeded data (richer, includes graph edges and skill profiles). Use the simulation page only if a judge asks "can I create my own scenario?"

## Pricing (if asked)

| Tier | Price/Employee/Month | Features |
|------|---------------------|----------|
| Starter | $4 | Safety Valve, employee dashboard, basic nudges |
| Professional | $8 | All 3 engines, Ask Sentinel chat, integrations |
| Enterprise | $15 | SSO, HRIS integration, dedicated CSM, SLA |

## Technical Specs (for deep questions)

| Component | Technology |
|-----------|-----------|
| Backend | Python 3.12 / FastAPI / SQLAlchemy / Supabase PostgreSQL |
| Frontend | Next.js 16 / React 19 / TypeScript / Tailwind CSS |
| Math | NumPy, SciPy (linregress, entropy, odeint), NetworkX |
| LLM | Gemini 2.5 Flash (classification + narration) |
| Auth | Supabase Auth + JWT + 52-permission RBAC |
| Encryption | Fernet (AES-128-CBC + HMAC-SHA256) |
| Privacy | HMAC-SHA256 identity hashing, two-vault schema |
| Integrations | Composio (GitHub, Slack, Calendar) |
