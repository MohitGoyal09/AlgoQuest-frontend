# Sentinel — Demo Guide

## Quick Start

```bash
# 1. Start services
docker compose up -d

# 2. Seed demo data
cd backend && python -m scripts.demo_seed

# 3. Open the app
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000/docs
```

## Demo Credentials

### Primary Demo Accounts

| Role | Email | Password | What They See |
|------|-------|----------|---------------|
| Admin | admin@sentinel.demo | Admin123! | All tabs, all teams, all users, audit logs |
| Manager | sarah.kim@sentinel.demo | Manager123! | Own wellbeing + team data |
| Manager | jordan.smith@sentinel.demo | Manager123! | Own wellbeing + team data |
| Employee | maria.santos@sentinel.demo | Employee123! | Own wellbeing only |

### Legacy Credentials (acme.com domain seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acme.com | Demo123! |
| Manager | eng.manager@acme.com | Demo123! |
| Employee | dev1@acme.com | Demo123! |

## Seed Data Personas (13 Users)

All users belong to tenant "Acme Technologies" across 3 teams: Engineering, Design, Data Science.

### Jordan Lee — THE BURNOUT (CRITICAL)

Senior dev who started working 70-hour weeks after a production incident. Commits at 2-3 AM, stopped replying to Slack, skipping standups, weekend work every week.

- Velocity: ~78 | Entropy: ~1.8 | Belongingness: ~0.25
- Event patterns: 6-8 commits/day clustered at 22:00-03:00, PR reviews declining, Slack dropping from 15/day to 3/day

### David Kim — THE WARNING (ELEVATED)

Mid-level dev with hours creeping up. Still engaged, but the trend is concerning. Working until 9-10 PM regularly.

- Velocity: ~60 | Entropy: ~1.2 | Belongingness: ~0.45
- Event patterns: 4-5 commits/day, some after_hours, moderate Slack activity

### Olivia Zhang — THE ISOLATED (ELEVATED)

Designer becoming disconnected. Low Slack, few PR interactions, declining meeting attendance. Not overworking, just withdrawing.

- Velocity: ~52 | Entropy: ~0.8 | Belongingness: ~0.2
- Event patterns: 2-3 commits/day normal hours, Slack declining from 12/day to 3/day

### Maria Santos — THE HEALTHY (LOW)

Solid contributor with consistent patterns. Active collaboration, regular hours. The control group.

- Velocity: ~22 | Entropy: ~0.5 | Belongingness: ~0.75
- Event patterns: 3-4 commits/day 09:00-17:30, active Slack, 5/5 standups

### Emma Thompson — THE HIDDEN GEM (LOW risk, HIGH betweenness)

Quietly bridges Engineering and Design. Moderate commits but unblocks 4-5 people weekly. High betweenness centrality, low eigenvector.

- Velocity: ~18 | Betweenness: ~0.85 | Eigenvector: ~0.15 | Unblocking: ~22
- Event patterns: 2-3 commits/day, 4-5 PR reviews/day across multiple teams, cross-team graph edges

### Other Users

| Name | Role | Team | Risk | Brief |
|------|------|------|------|-------|
| Sarah Chen | Admin | Engineering | LOW | Balanced exec |
| James Wilson | CTO | Engineering | LOW | Strategic focus |
| Priya Sharma | Manager | Engineering | ELEVATED | Overloaded with meetings |
| Alex Rivera | Manager | Design | LOW | Well-organized lead |
| Chen Wei | Lead | Data Science | LOW | Steady analytics |
| Noah Patel | Designer | Design | LOW | Consistent |
| Liam Carter | Analyst | Data Science | LOW | Steady |
| Sofia Martinez | Analyst | Data Science | LOW | Consistent |

## Seed Data Volume

| Data Type | Count |
|-----------|-------|
| Users | 13 |
| Teams | 3 (Engineering, Design, Data Science) |
| Events | ~1000+ (14 days of behavioral data) |
| Risk history entries | ~390 (30 per user) |
| Graph edges | 60+ (collaboration network) |
| Audit logs | 100+ (12 action types) |
| Chat sessions | 2 pre-seeded sample conversations |
| Skill profiles | 13 (curated per persona) |
| Centrality scores | 13 (curated per persona) |

All seed data is deterministic (seeded `Random(42)`) — same script produces identical data every run.

## Demo Script (3 Minutes)

### Minute 1 — The Problem + Admin View (60s)

> "76% of employees experience burnout. Current detection happens in exit interviews — 6 months too late. Sentinel catches it 30 days earlier."

1. Login as admin
2. Show dashboard: org overview, risk distribution (2 CRITICAL, 3 ELEVATED, 8 LOW)
3. Point to team health map

### Minute 2 — The Engine (60s)

1. Navigate to Safety Valve engine
2. Show Jordan Lee (CRITICAL): velocity 78, confidence 91%
3. Point to indicators: chaotic hours, social withdrawal, sustained intensity
4. Say: "This is math, not AI opinion. Velocity is linear regression. Belongingness is response rate. Entropy is Shannon's formula."
5. Click "Generate 1:1 Agenda" — show AI-generated talking points

### Minute 3 — Privacy + Network (60s)

1. Switch to Talent Scout: show network graph
2. Point to Emma (hidden gem): "High betweenness, high unblocking, low eigenvector. This person holds two teams together."
3. Privacy pitch: "We never see message content. Our analytics DB has only anonymous hashes and timestamps. Two separate vaults, no JOIN possible."

## What NOT to Say

| Do Not Say | Say Instead |
|------------|-------------|
| "We use AI" | "We use mathematical models" |
| "We predict behavior" | "We identify pattern changes" |
| "We identify high performers" | "We find over-connected employees at retention risk" |
| "30-day prediction" | "Early warning signals" (until validated) |
| "Automated interventions" | "Insights and recommendations — humans decide" |

## Known Demo Failure Points

| Risk | Severity | Mitigation |
|------|----------|------------|
| LLM API key expired/rate-limited | High | Test key 30 min before demo |
| Supabase free tier cold start | Medium | Hit /health endpoint 5 min before |
| Redis not running | Medium | Chat works without Redis (degrades gracefully) |
| Network graph empty after fresh seed | Low | Seed script creates edges deterministically |
