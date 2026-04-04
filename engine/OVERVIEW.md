# Sentinel — Product Overview

## One-Line Pitch

Sentinel is a smoke detector for employee burnout — measuring the velocity of behavioral change using metadata only, never message content, with a two-vault cryptographic privacy architecture that makes identity resolution mathematically impossible without the vault key.

## The Problem

| Metric | Value |
|--------|-------|
| Employees experiencing burnout | 76% (HBR) |
| Annual cost to US organizations | $500B |
| Average detection time | 6 months (at exit interview) |
| Cost per engineer resignation | $150K-$300K |

Current solutions fail because surveys are snapshots, surveillance tools read content (illegal in EU, destroys trust), and performance reviews happen quarterly while burnout happens weekly.

## What Sentinel Does

Sentinel measures **velocity of behavioral change** — not absolute values. A night owl is never flagged for working late. Only a sudden shift from their personal baseline triggers an alert. The system uses three specialized engines:

### Safety Valve — Burnout Prevention

Detects burnout risk using mathematical signals:
- **Velocity**: Slope of linear regression on daily activity scores (NumPy/SciPy linregress)
- **Belongingness**: Reply rate + mention rate in communications
- **Circadian Entropy**: Shannon entropy of work-hour distribution (schedule chaos)
- **Threshold**: `IF velocity > 2.5 AND belongingness < 0.3 AND entropy > 1.5 → CRITICAL`

### Talent Scout — Hidden Gem Discovery

Uses Organizational Network Analysis (NetworkX) to find structurally critical people invisible to traditional metrics:
- **Betweenness centrality**: Who bridges disconnected teams
- **Eigenvector centrality**: Connection to influential people
- **Unblocking score**: Who helps others get unstuck
- **Hidden gem**: `betweenness > 0.3 AND unblocking_count > 5 AND eigenvector < 0.2`

### Culture Thermometer — Team Health

Aggregates individual risks to detect team-level patterns using an adapted SIR (Susceptible-Infected-Recovered) epidemiological model (scipy.odeint). Detects when burnout is spreading across a team.

## Two-Vault Privacy Architecture

The core differentiator. Privacy by physics, not policy.

```
              DATA FLOW
                 |
                 v
       +-------------------+
       | Privacy Boundary   |
       | HMAC-SHA256(email) |
       +--------+----------+
                |
      +---------+---------+
      |                   |
      v                   v
+-----------+       +-----------+
| VAULT A   |       | VAULT B   |
| analytics |       | identity  |
|           |       |           |
| user_hash |       | user_hash |
| events    |       | email_enc |
| scores    |       | AES-256   |
| NO PII    |       | RBAC data |
+-----------+       +-----------+
  Cannot JOIN       Encrypted at rest
```

Even a full database breach yields only anonymous hashes (Vault A) and encrypted blobs (Vault B). No foreign key constraints between schemas. The attacker needs the vault key to connect them.

## Deterministic Sandwich

AI does NOT make decisions. Math makes decisions. AI writes text.

```
Layer 1: INGESTION    → Python validation, schema checks
Layer 2: ANALYSIS     → NumPy/SciPy (pure math, deterministic)
Layer 3: GENERATION   → LLM for text ONLY (never sees raw data)
```

## Target Market

- **Primary buyer**: CHRO / VP People Ops, Engineering Managers, CTO
- **Company size**: 100-5,000 employees (mid-market)
- **Industry**: Technology, financial services, consulting, healthcare
- **TAM**: $8B+ (HR analytics + employee wellness)
- **SAM**: $2B (mid-market tech companies)

## Pricing Model

| Tier | Price/Employee/Month | Features |
|------|---------------------|----------|
| Starter | $4 | Safety Valve, employee dashboard, basic nudges |
| Professional | $8 | All 3 engines, Ask Sentinel chat, 1:1 agendas, integrations |
| Enterprise | $15 | Everything + SSO, HRIS, dedicated CSM, SLA, custom thresholds |

## Current State

The product is functional and demo-ready. Six phases of RBAC are complete. The backend has 25 endpoint modules, 27 service files, and 9 data models. The frontend has 29 page routes and 100+ components. However: zero real users, zero validation data, and several features exist as UI shells over seed data.
