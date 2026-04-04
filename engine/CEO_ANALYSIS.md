# Sentinel — Strategic Analysis

Source: Internal CEO analysis (April 2026). Confidential.

## Product-Market Fit Assessment

**The problem is real**: $500B annual cost, 76% of employees experience burnout, detection happens at exit interviews (6 months too late). Current solutions (surveys, performance reviews, surveillance tools) all have fundamental flaws.

**The approach is sound**: Measuring velocity of behavioral change from personal baselines using metadata only — not content. This addresses legitimate gaps no competitor covers.

**The risk is execution**: Solo founder with AI-augmented development. All code written by one person + AI. Impressive for prototype speed but unsustainable for production.

## Competitive Positioning

| Feature | Sentinel | Culture Amp | Lattice | Viva Insights | Peakon |
|---------|----------|-------------|---------|---------------|--------|
| Approach | Passive behavioral metadata | Annual/pulse surveys | Performance reviews | MS Graph analytics | Surveys |
| Data type | Metadata only (timestamps) | Self-reported | Self-reported + goals | MS 365 usage | Self-reported |
| Frequency | Continuous/real-time | Quarterly/pulse | Quarterly | Weekly digest | Continuous pulse |
| Privacy | Two-vault cryptographic | Survey anonymity | Role-based access | Same tenant as employer | Survey anonymity |
| Burnout detection | Predictive (velocity-based) | Reactive (survey scores) | None | Descriptive (hours) | Reactive |
| Network analysis | First-class engine (ONA) | None | None | Secondary | None |
| Time to value | 2 weeks | 4-8 weeks | 2-4 weeks | Instant (M365 only) | 4-6 weeks |

**Key insight**: No competitor combines passive metadata collection with cryptographic privacy separation and predictive analytics.

## Core Differentiators (Ranked by Defensibility)

| # | Differentiator | Why It's Hard to Copy |
|---|----------------|-----------------------|
| 1 | Two-vault privacy architecture | Baked into every data flow. Cannot be bolted on. |
| 2 | Deterministic sandwich | Requires rebuilding entire analytics pipeline. |
| 3 | Personal baseline approach | Requires 21+ days of continuous data per user. |
| 4 | ONA as first-class engine | Requires graph infrastructure + behavioral data. |
| 5 | 36-hour critical override | Novel ethical framework, no competitor precedent. |
| 6 | Employee monitoring pause | Zero competitors offer temporal consent control. |

## Honest Assessment (70% Genuine, 30% Gimmick)

### What's Genuine (Keep)

- Real problem ($500B market)
- Privacy architecture (strongest moat)
- Scientific approach (personal baselines, deterministic math)
- Ethical foundation (employee-first, consent controls, monitoring pause)

### What's Risky (Fix Messaging)

| Element | Risk | Recommended Fix |
|---------|------|----------------|
| Three engines simultaneously | Feature bloat — each could be its own product | Keep all three (shared infra), but focus Safety Valve for initial sales |
| "Hidden gem" detection | Employees see it as performance tracking | Reframe as "workload balancer" and "retention risk indicator" |
| SIR contagion model | Scientifically questionable, hard to explain | Keep internally, show chart but don't explain epidemiology to buyers |
| "30-day prediction" claim | Unvalidated, legal exposure | Change to "early warning signals" until validated |
| Automated Slack nudges | Can feel intrusive | Employee controls frequency, manager never sees nudge content |

## Critical Gaps

| Priority | Gap | Impact |
|----------|-----|--------|
| P0 | No real data ingestion | Cannot prove value with real customers |
| P0 | No validation study | "30-day prediction" is an unvalidated hypothesis |
| P0 | Minimum group size missing | Manager of 2-person team can deduce identity |
| P0 | Risk factor attribution missing | "Why is this person flagged?" has no answer |
| P1 | No nudge response loop | Detect → nudge → stop (no feedback) |
| P1 | No manager action tracking | No accountability after seeing risk signal |
| P1 | No database migrations | Production deployment impossible without Alembic |
| P1 | No end-to-end tests | Regression risk on every change |

## Market Risks

| Risk | Probability | Mitigation |
|------|------------|------------|
| Employees perceive Sentinel as surveillance | High | Employee-first messaging, consent controls, monitoring pause, transparency |
| Microsoft ships Viva Insights burnout prediction | Medium | Differentiate on privacy (Viva lives in same tenant as employer) |
| Velocity metric doesn't correlate to real burnout | High | 6-month shadow mode study before making claims |
| False positive rate too high | High | Calibration against real data + adjustable thresholds |

## Monetization

| Tier | $/Employee/Month | Features |
|------|-------------------|----------|
| Starter | $4 | Safety Valve, employee dashboard, basic nudges, email support |
| Professional | $8 | All 3 engines, Ask Sentinel, 1:1 agendas, workflows, integrations |
| Enterprise | $15 | Everything + SSO, HRIS, dedicated CSM, SLA, audit API, custom thresholds |

### Revenue Projections

| Scenario | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| Conservative (5 customers, 200 employees avg, Pro) | $96K | $384K | $960K |
| Moderate (15 customers, 300 employees avg, mix) | $432K | $1.3M | $3.2M |
| Aggressive (30 customers, 500 employees avg, mix) | $1.2M | $4M | $10M |

### Unit Economics

- Gross margin target: 80%+ (SaaS standard)
- Infra cost per customer: ~$50-200/month (Supabase Pro + Redis + Gemini API)
- LLM cost per active user: ~$0.02-0.05/day (Gemini 2.5 Flash, minimal tokens)
- Customer acquisition cost target: $5K-15K
- LTV:CAC target: >3x
- Payback period target: <12 months

## Team Needs (Hire Order)

| Role | Priority | When | Why |
|------|----------|------|-----|
| Backend Engineer (Python/FastAPI) | P0 | Month 1 | Real data pipeline, production hardening |
| Data Scientist | P0 | Month 1 | Validate burnout correlation, calibrate thresholds |
| Frontend Engineer (Next.js/React) | P1 | Month 2 | Polish, accessibility, mobile, E2E tests |
| DevOps/SRE | P1 | Month 2 | Production deploy, monitoring, CI/CD, SOC 2 |
| Product/Customer Success | P1 | Month 3 | Pilot management, feedback loops |
| Legal/Compliance Advisor | P1 | Month 3 | Employment law, GDPR, privacy policy |
| Sales/BD | P2 | Month 4 | After validation data exists |

## Timeline to Revenue

| Milestone | Timeline |
|-----------|----------|
| First pilot signed (shadow mode) | Month 1-2 |
| Real data flowing | Month 2-3 |
| 30-day baseline established | Month 3-4 |
| First validated burnout detection | Month 4-6 |
| First paying customer | Month 6-8 |
| 3 case studies published | Month 8-12 |

## The 30-Second Pitch

> "Sentinel is a smoke detector for burnout. We measure when work patterns change — not what people do — and provide early warnings before burnout becomes attrition. Unlike surveys, we're continuous. Unlike surveillance tools, we never read message content. Our two-vault architecture makes it mathematically impossible to connect analytics to identity."
