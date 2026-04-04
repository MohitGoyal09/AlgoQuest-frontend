# How Sentinel Works in the Real World

## The Data Pipeline (Real-World, Not Demo)

### What We Connect To

| Data Source | Metadata We Extract | What We DO NOT Read |
|---|---|---|
| Slack / MS Teams | Message timestamps, channel activity counts, DM response times, after-hours flag | Message content, attachments, reactions |
| GitHub / Jira | Commit timestamps, PR review turnaround, ticket state-change timestamps | Code content, commit messages, ticket descriptions |
| Google Calendar / Outlook | Meeting count, duration, back-to-back density, after-hours meetings | Meeting titles, attendees by name, agenda content |
| PagerDuty | On-call frequency, escalation timestamps, midnight wake-ups | Incident details, runbook content |
| Email (Exchange/Gmail) | Send/receive timestamps, response latency, volume per day | Subject lines, body text, attachments |

**The principle:** We measure WHEN, not WHAT. A timestamp tells us everything about work patterns. Message content tells us nothing we need and everything we should not have.

### How Data Flows Through the System

```
Raw API Data
    |
    v
[1] INGESTION LAYER (Python validation)
    - Schema validation (reject malformed data)
    - Hash email with HMAC-SHA256 --> user_hash
    - Strip all PII
    - Store behavioral event in Vault A (analytics DB)
    - Store encrypted identity in Vault B (identity DB)
    |
    v
[2] ANALYSIS LAYER (Pure math, no AI)
    - NumPy/SciPy: Calculate velocity, entropy, belongingness
    - NetworkX: Calculate betweenness centrality, eigenvector centrality
    - SciPy ODE: Run SIR contagion model for team health
    - Output: risk_level, confidence_score, metrics dictionary
    |
    v
[3] GENERATION LAYER (LLM, text only)
    - Input: math output (risk scores, metric values)
    - LLM (Gemini 2.5 Flash) generates human-readable narrative
    - LLM generates 1:1 agenda talking points
    - LLM NEVER sees raw employee data, only aggregated math output
```

---

## How We Calculate Burnout Risk

### Signal 1: Velocity (Rate of Change)

**What it measures:** How fast someone's work schedule is shifting from their personal baseline.

**The math:**
```
daily_scores = [activity_score for each day in trailing 21-day window]
slope, intercept, r_value, p_value, std_err = scipy.stats.linregress(days, daily_scores)
velocity = slope
confidence = r_value ** 2   # R-squared
```

**What the numbers mean:**
| Velocity | Interpretation |
|----------|---------------|
| 0.0 - 0.5 | Stable. Normal fluctuation. |
| 0.5 - 1.5 | Mild drift. Monitor but do not alert. |
| 1.5 - 2.5 | Elevated. Pattern is shifting meaningfully. |
| > 2.5 | Critical. Rapid acceleration in work intensity. |

**Key insight:** We compare to the individual's OWN baseline, not a company average. A person who normally works 50-hour weeks is not flagged. A person who jumps from 40 to 55 hours over three weeks IS flagged -- because their pattern changed.

### Signal 2: Circadian Entropy (Schedule Chaos)

**What it measures:** How chaotic someone's work schedule has become. A regular 9-to-6 schedule has low entropy. Working at random hours across the day and night has high entropy.

**The math:**
```
hour_distribution = [fraction_of_work_in_each_hour for 24 hours]
entropy = scipy.stats.entropy(hour_distribution)
# Maximum entropy (uniform distribution across 24 hours) = ln(24) = 3.18
```

**What the numbers mean:**
| Entropy | Interpretation |
|---------|---------------|
| 0.0 - 1.0 | Concentrated schedule. Working in a tight window. Healthy. |
| 1.0 - 1.5 | Normal spread. Some flexibility but predictable. |
| 1.5 - 2.0 | Elevated chaos. Schedule is fragmenting. |
| > 2.0 | High chaos. Working at all hours. Strong burnout signal. |

### Signal 3: Belongingness (Social Connection)

**What it measures:** Whether someone is still engaged with their team or withdrawing.

**The math:**
```
reply_rate = messages_replied / messages_received (trailing 14 days)
mention_rate = times_mentioned_by_others / team_average_mentions
belongingness = weighted_average(reply_rate, mention_rate)
```

**What the numbers mean:**
| Belongingness | Interpretation |
|---------------|---------------|
| 0.7 - 1.0 | Highly engaged. Responding, being mentioned, connected. |
| 0.4 - 0.7 | Normal range. Some variation is expected. |
| 0.3 - 0.4 | Declining. Withdrawing from team interactions. |
| < 0.3 | Critical. Socially disconnected from the team. |

### Combined Risk Assessment

```
IF velocity > 2.5 AND belongingness < 0.3 AND entropy > 1.5:
    risk = CRITICAL
ELIF velocity > 1.5 AND (belongingness < 0.4 OR entropy > 1.5):
    risk = HIGH
ELIF velocity > 1.0 AND confidence > 0.7:
    risk = ELEVATED
ELSE:
    risk = NORMAL
```

The R-squared confidence score gates every alert. Below 80% confidence, the system reports "insufficient data" instead of guessing.

---

## Real-World Scenarios

### Scenario 1: Knowledge Worker at a Bank (NatWest profile)

**Who:** Priya, a data engineer at NatWest's Gurgaon GCC. Team of 8. Uses Outlook, Jira, MS Teams daily.

**Week 1-2 baseline:** Sends first email at 9:15 AM. Last Teams message at 6:30 PM. Replies to 85% of DMs within 2 hours. Attends 4-5 meetings/day. Entropy: 0.9 (concentrated 9-to-6 pattern).

**Week 3-4 (change begins):** Sprint deadline approaching. First email shifts to 8 AM. Last message now 9 PM. Meeting count jumps to 7/day. Reply rate drops to 60%. Entropy rises to 1.4.

**What Sentinel detects:**
- Velocity: 1.8 (elevated -- her schedule is stretching)
- Entropy: 1.4 (schedule spreading into early morning and late evening)
- Belongingness: 0.55 (declining but not critical -- still in meetings, less responsive in DMs)
- Risk: HIGH (velocity + entropy trending up, belongingness trending down)
- Confidence: 87%

**What happens:** Priya sees her own dashboard showing "elevated strain." She gets a nudge: "Your focus time has decreased 40% this sprint. Want to block Thursday morning for deep work?" Her manager sees an aggregate team health score -- not Priya's individual data.

### Scenario 2: Sales Manager at PepsiCo

**Who:** Rahul, a regional sales manager at PepsiCo's Gurgaon HQ. Manages 15 field sales reps. Uses Outlook, SAP CRM, WhatsApp (personal -- not tracked).

**What Sentinel can see:** Outlook calendar (meetings, reviews, travel schedules). Email timestamps. SAP CRM login patterns. Cannot see WhatsApp calls, in-person meetings with distributors, or field visits.

**What Sentinel detects over 4 weeks:**
- Calendar density doubled (from 5 to 10 meetings/day during quarter-end push)
- Email response time increased from 1 hour to 6 hours
- Weekend emails appeared (previously zero)
- Velocity: 2.1, Entropy: 1.3, Belongingness: 0.6
- Risk: ELEVATED (not critical because belongingness is still reasonable)
- Confidence: 72% (lower because WhatsApp and field work create data gaps)

**What Sentinel reports:** "Elevated workload indicators. Calendar density is 2x baseline. Signal confidence is moderate -- recommend combining with manager check-in." Because confidence is below 80%, the system explicitly flags the limitation.

**Honest limitation:** Much of Rahul's real work happens on WhatsApp and in-person visits. Sentinel has partial visibility. We acknowledge this with a lower confidence score rather than pretending we see everything.

### Scenario 3: Consulting Team at Grant Thornton

**Who:** A team of 6 auditors working on two simultaneous client engagements. They use Outlook, Teams, and a shared audit management platform.

**What Sentinel detects across the team:**
- 4 of 6 team members show velocity > 1.5 (elevated)
- Team communication graph is fragmenting -- people are siloing by client engagement
- Meeting hours for the team are up 60% month-over-month
- One senior auditor (the team bridge) has belongingness dropping from 0.7 to 0.3

**Culture Thermometer flags:** "Team showing correlated stress patterns. Communication graph fragmentation increasing. Risk of resignation contagion: ELEVATED."

**What the partner sees:** Aggregate team health dashboard. Not individual names. The signal: "This team is overloaded and starting to fragment. Consider rebalancing client assignments or adding capacity."

---

## Score Validation: The Honest Answer

### What Is Validated (peer-reviewed science)

| Method | Validation Status | Citation |
|--------|-------------------|----------|
| Linear regression for trend detection | Well-established | Standard statistical method, centuries of use |
| Shannon entropy for distribution analysis | Well-established | Claude Shannon, 1948. Used across engineering and science |
| Graph centrality metrics (betweenness, eigenvector) | Well-established | Freeman, 1977. Standard in organizational network analysis |
| SIR epidemiological model | Well-established for disease | Kermack & McKendrick, 1927. Adapted for social contagion |

### What Is NOT Validated (our hypotheses)

| Hypothesis | Status | What We Need |
|------------|--------|-------------|
| Velocity > 2.5 correlates with burnout | Unvalidated | 6-month shadow study with exit interview correlation |
| Entropy > 1.5 indicates schedule chaos leading to burnout | Unvalidated | Longitudinal data comparing entropy to self-reported wellbeing |
| Belongingness < 0.3 predicts social withdrawal | Plausible but unvalidated | Compare with engagement survey scores |
| SIR model applies to burnout spread in teams | Adapted, not proven | Compare predicted contagion with actual resignation cascades |
| Combined signals predict burnout 2-4 weeks early | The central claim, unvalidated | Shadow deployment comparing predictions to actual outcomes |

**We are transparent about this distinction.** The mathematical methods are sound. The specific thresholds and the burnout correlation are our hypotheses. We plan to validate them.

### How We Would Validate (roadmap)

1. **Shadow mode deployment** (Month 1-4): Deploy at a pilot company. Collect signals. Do NOT intervene. Compare predictions against actual outcomes (sick days, resignations, self-reported wellbeing).
2. **Threshold calibration** (Month 4-6): Adjust velocity, entropy, and belongingness thresholds based on real correlation data.
3. **A/B testing interventions** (Month 6-12): For validated signals, test whether nudges actually reduce burnout outcomes versus a control group.
4. **Longitudinal study** (Year 1-2): Publish results. Establish evidence base.

---

## Limitations We Acknowledge

### Who We Cannot Help (Yet)

| Worker Type | Why | Roadmap |
|-------------|-----|---------|
| Factory floor operators | No digital footprint in email/calendar/Slack | Phase 2: HRMS integration for shift data, overtime, absenteeism |
| Truck drivers | On the road, no desk tools | Phase 2: Telematics integration (GPS patterns, driving hours) |
| Field sales reps | Work happens via WhatsApp and in-person | Partial coverage via email/calendar. Phase 2: CRM integration |
| Gig workers / contractual labor | No organizational digital presence | No current solution. Requires platform-level integration |
| Workers in the informal economy | No digital trail at all | Outside our scope. Policy intervention needed. |

### Where Our Data Is Incomplete

| Gap | Impact | Mitigation |
|-----|--------|------------|
| Face-to-face conversations | Missing social signal | Weight confidence score lower in low-digital-signal environments |
| Phone calls (WhatsApp, personal) | Missing communication data | Acknowledge gap. Do not overstate coverage. |
| Offline work (reading, thinking, planning) | Undercount of productive hours | Measure pattern change, not absolute hours |
| Personal context (health, family, life events) | Burnout might be personal, not work-related | Sentinel flags the signal. A human decides the response. We never diagnose. |

### What We Are Building Next

| Feature | Timeline | Why |
|---------|----------|-----|
| HRMS connectors (SAP HCM, Workday) | Phase 2 | Extend to shift workers via attendance and overtime data |
| Real data ingestion pipeline | Next sprint | Move from seed data to live API connections |
| Validated thresholds | 6-month shadow study | Replace hypothetical thresholds with empirically calibrated ones |
| Minimum group size enforcement | Next sprint | Prevent managers of 2-3 person teams from deducing individual identity |
| Risk factor attribution | Phase 2 | Answer "WHY is this person flagged?" not just "they are flagged" |

---

## The "Not Surveillance" Argument

### What We Measure vs What We Do Not

| We Measure | We Do NOT Measure |
|---|---|
| When you sent a message (timestamp) | What you said (content) |
| How many meetings you had (count) | What was discussed (agenda, notes) |
| Whether you worked after 9 PM (schedule pattern) | What you were working on (task content) |
| How quickly you reply to DMs (response latency) | Who you are talking to (by name -- only hashed IDs) |
| Whether your schedule is becoming chaotic (entropy) | What is causing the chaos (personal, work, both) |
| Whether you are responding less to your team (belongingness) | Why you are responding less (mood, workload, conflict) |

### How Two-Vault Architecture Protects Privacy

**For the non-technical judge:**
"Imagine two locked safes in two different buildings. Safe A has anonymous work patterns attached to random codes -- no names. Safe B has encrypted names attached to the same codes. Even if someone breaks into both safes, they cannot connect the dots without a special key that we generate only when sending an employee their own wellbeing nudge. And every time that key is used, it is logged in an immutable audit trail."

**For the technical judge:**
"Vault A (analytics): user_hash (HMAC-SHA256 of email with salt), event_type, timestamp, metadata. No PII. No foreign key constraint to Vault B. Vault B (identity): user_hash, email_encrypted (AES-256 Fernet). The two schemas have no JOIN capability by design. Identity resolution requires the vault key, which is held separately and every resolution generates an audit log entry."

### Why Employees Would Opt In

The value proposition for the EMPLOYEE, not just the manager:

1. **You see your own data.** Log in and see your velocity, entropy, and belongingness trends. It is YOUR data about YOUR patterns.
2. **You get early warning.** "Your focus time dropped 40% this sprint" is useful information -- like a fitness tracker telling you your sleep quality declined.
3. **You control the system.** One-click opt-out. Monitoring pause (temporarily stop tracking during sensitive periods). You choose your nudge frequency.
4. **Your manager never sees YOUR data.** Managers see aggregate team health. Not your name. Not your score. The minimum group size ensures individual identity cannot be deduced.
5. **It protects you from being blindsided.** Better to get a nudge about rising stress than to crash and burn without warning.

---

## Competitor Comparison for Indian Market

### What Works in India vs Silicon Valley

| Factor | Silicon Valley | India |
|--------|---------------|-------|
| Remote work prevalence | High (50%+ hybrid/remote) | Low (most companies office-first) |
| Digital tool adoption | Saturated (Slack, Notion, Linear, etc.) | Mixed (email + WhatsApp dominant outside tech) |
| Survey culture | Fatigued (too many surveys) | Strong (employees still respond to surveys) |
| Employee trust in HR tools | Moderate | Low (hierarchical culture, fear of manager overreach) |
| Privacy regulation | GDPR (strict) | DPDPA 2023 (new, evolving, strict on consent) |
| Burnout awareness | High (destigmatized) | Growing but still stigmatized in many industries |
| HRMS penetration | High (Workday, BambooHR) | Mixed (SAP dominant in enterprise, manual in mid-market) |

### Why Survey Tools (Culture Amp, Peakon) Still Work in India

Surveys have not hit fatigue in India the way they have in the US. Response rates are higher. Culture Amp and Peakon are genuinely useful for Indian companies. We do not need to attack them -- we need to complement them.

**Our position:** "Surveys tell you how employees FEEL. We tell you how they are BEHAVING. Use both. Surveys are quarterly snapshots. We are continuous. When the survey says 'team morale is fine' but our signals show velocity spiking, that is the early warning surveys miss."

### Our Edge in the Indian Context

1. **Privacy-first matters MORE in India** where employee trust in HR is lower. "Your manager cannot see your data" is a stronger selling point in India than in the US.

2. **DPDPA 2023 favors our architecture.** The law requires explicit consent, purpose limitation, and data minimization. Our two-vault architecture was designed for this. Competitors bolting on DPDPA compliance will struggle.

3. **India's knowledge worker population is growing rapidly.** IT/ITES alone employs 5.4 million. Add banking, consulting, media, and government -- the addressable market is expanding every year.

4. **Cost of attrition is proportionally higher in India.** Replacing a senior engineer in India costs INR 15-25 lakh (recruitment, training, ramp-up, lost productivity). Indian companies are cost-conscious -- a $4/employee/month tool that prevents even two departures per year pays for itself 10x over.

5. **WhatsApp-heavy communication is actually an advantage for our approach.** Competitors that rely on reading Slack messages have zero data in India where WhatsApp dominates informal work communication. Our metadata-only approach works with whatever digital signals exist -- we do not need message content.
