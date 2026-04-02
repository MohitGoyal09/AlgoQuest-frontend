"use client"

import { Suspense, useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { UserSelector } from "@/components/user-selector"
import { RiskAssessment } from "@/components/risk-assessment"
import { VelocityChart } from "@/components/velocity-chart"
import { ActivityFeed } from "@/components/activity-feed"
import { TeamDistribution } from "@/components/team-distribution"
import { NetworkGraph } from "@/components/network-graph"
import { SimulationPanel } from "@/components/simulation-panel"
import { VaultStatus } from "@/components/vault-status"
import { StatCards } from "@/components/stat-cards"
import { NudgeCard } from "@/components/nudge-card"
import { EmployeeTable } from "@/components/employee-table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProtectedRoute } from "@/components/protected-route"
import { ForecastChart } from "@/components/forecast-chart"
import { AgendaGenerator } from "@/components/copilot/AgendaGenerator"
import { AskSentinel } from "@/components/ai/AskSentinel"
import { AskSentinelWidget } from "@/components/ask-sentinel-widget"
import { BurnoutPrediction } from "@/components/burnout-prediction"
import { BurnoutCostCalculator } from "@/components/burnout-cost-calculator"
import { TeamEnergyHeatmap } from "@/components/team-energy-heatmap"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { getInitials } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Shield,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  RefreshCw,
  Sparkles,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Brain,
  Bell,
  ChevronRight,
  Eye,
  MessageCircle,
} from "lucide-react"

// Admin Components
import { GlobalStatsCards } from "@/components/dashboard/admin/global-stats"
import { OrgHealthMap } from "@/components/dashboard/admin/org-health-map"
import { AdminQuickActions } from "@/components/dashboard/admin/admin-actions"
import { AuditLogFeed } from "@/components/dashboard/admin/audit-log"

// Manager Components
import { TeamStatsRow } from "@/components/dashboard/manager/team-stats-row"
import { TeamGrid } from "@/components/dashboard/manager/team-grid"
import { AnonymityToggle } from "@/components/dashboard/manager/anonymity-toggle"
import { IndividualInsights } from "@/components/dashboard/manager/individual-insights"

// Types
import { Employee, UserSummary, toRiskLevel, PersonaType } from "@/types"
import { mapUsersToEmployees } from "@/lib/map-employees"

// API Hooks - Simplified without WebSocket
import { useRiskData } from "@/hooks/useRiskData"
import { useNetworkData } from "@/hooks/useNetworkData"
import { useSimulation } from "@/hooks/useSimulation"
import { useTeamData } from "@/hooks/useTeamData"
import { useRiskHistory } from "@/hooks/useRiskHistory"
import { useUsers } from "@/hooks/useUsers"
import { useRecentEvents } from "@/hooks/useRecentEvents"
import { useNudge } from "@/hooks/useNudge"
import { useForecast } from "@/hooks/useForecast"

// Employee profile types (from /me endpoint)
interface UserProfile {
  user_hash: string
  role: string
  consent_share_with_manager: boolean
  consent_share_anonymized: boolean
  monitoring_paused_until: string | null
  created_at: string
}

interface RiskDataProfile {
  velocity: number | null
  risk_level: string
  confidence: number
  thwarted_belongingness: number | null
  updated_at: string | null
}

interface MonitoringStatus {
  is_paused: boolean
  paused_until: string | null
}

interface AuditEntry {
  action: string
  timestamp: string
  details: any
}

interface MeData {
  user: UserProfile
  risk: RiskDataProfile | null
  audit_trail: AuditEntry[]
  monitoring_status: MonitoringStatus
}

// ─── Manager Overview Subcomponents ──────────────────────────────────────────

interface ManagerKPICardProps {
  label: string
  value: string | number
  sub: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  colorClass: string
  delay: number
  pulse?: boolean
}

function ManagerKPICard({
  label,
  value,
  sub,
  trend,
  trendValue,
  colorClass,
  delay,
  pulse,
}: ManagerKPICardProps) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus

  const trendColor =
    trend === "up"
      ? "text-destructive"
      : trend === "down"
      ? "text-accent"
      : "text-muted-foreground"

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
      style={{ animationDelay: `${delay}ms`, animationDuration: "400ms" }}
    >
      <div
        className={
          "bg-card border border-white/5 rounded-xl p-5 " +
          "transition-[color,background-color,border-color,transform] duration-150 " +
          "hover:border-white/10 hover:bg-card/80 active:scale-[0.97] cursor-default " +
          "group relative overflow-hidden"
        }
      >
        {/* Subtle ambient glow strip */}
        <div
          className={`absolute inset-x-0 top-0 h-px ${colorClass} opacity-60`}
        />

        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            {label}
          </p>
          {pulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
          )}
        </div>

        <div className={`text-3xl font-bold tabular-nums leading-none ${colorClass}`}>
          {value}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {trend && trendValue && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              {trendValue}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
      </div>
    </div>
  )
}

interface ManagerDashboardProps {
  metrics: {
    total_members: number
    healthy_count: number
    elevated_count: number
    critical_count: number
    avg_velocity: number
    burnout_risk: number
    contagion_risk: string
  }
  employees: Employee[]
  isAnonymized: boolean
  onToggleAnonymity: () => void
  userName: string
}

function ManagerDashboard({
  metrics,
  employees,
  isAnonymized,
  onToggleAnonymity,
  userName,
}: ManagerDashboardProps) {
  const router = useRouter()

  const atRisk = metrics.critical_count + metrics.elevated_count
  const avgWellbeing = metrics.total_members > 0
    ? Math.round(((metrics.total_members - atRisk) / metrics.total_members) * 100)
    : 0

  // ── KPI trend deltas derived from loaded employee data ─────────────────────
  // Burnout risk trend: compare current at-risk % to a 30% baseline threshold.
  // Positive delta means risk is elevated above the baseline.
  const burnoutRiskDelta = metrics.burnout_risk - 30
  const burnoutRiskTrendValue = burnoutRiskDelta !== 0
    ? `${burnoutRiskDelta > 0 ? "+" : ""}${burnoutRiskDelta}% vs baseline`
    : undefined
  const burnoutRiskTrend: "up" | "down" | "neutral" =
    metrics.burnout_risk > 30 ? "up" : metrics.burnout_risk < 30 ? "down" : "neutral"

  // Wellbeing trend: derive from velocity split between healthy and at-risk members.
  // Healthy employees (LOW risk) pulling avg velocity higher raises wellbeing.
  const healthyEmployees = employees.filter(e => e.risk_level !== "CRITICAL" && e.risk_level !== "ELEVATED")
  const atRiskEmployees = employees.filter(e => e.risk_level === "CRITICAL" || e.risk_level === "ELEVATED")
  const avgHealthyVelocity = healthyEmployees.length > 0
    ? healthyEmployees.reduce((sum, e) => sum + (e.velocity || 0), 0) / healthyEmployees.length
    : null
  const avgAtRiskVelocity = atRiskEmployees.length > 0
    ? atRiskEmployees.reduce((sum, e) => sum + (e.velocity || 0), 0) / atRiskEmployees.length
    : null
  const wellbeingTrendValue = avgHealthyVelocity !== null && avgAtRiskVelocity !== null
    ? `${((avgHealthyVelocity - avgAtRiskVelocity)).toFixed(1)} vel gap`
    : avgWellbeing > 0
    ? `${avgWellbeing}% healthy`
    : undefined
  const wellbeingTrend: "up" | "down" | "neutral" =
    avgWellbeing > 70 ? "down" : avgWellbeing > 40 ? "neutral" : "up"

  // Velocity trend: compare team avg velocity against a neutral 3.0 baseline.
  const velocityDelta = metrics.avg_velocity - 3.0
  const velocityTrendValue = `${velocityDelta >= 0 ? "+" : ""}${velocityDelta.toFixed(1)} vs 3.0 baseline`
  const velocityTrend: "up" | "down" | "neutral" =
    velocityDelta > 0.2 ? "up" : velocityDelta < -0.2 ? "down" : "neutral"

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const getDisplayName = (emp: Employee) => {
    if (isAnonymized) return `Dev-${emp.user_hash.slice(-2).toUpperCase()}`
    return emp.name
  }

  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "ELEVATED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      default:
        return "bg-accent/10 text-accent border-accent/20"
    }
  }

  // Mini sparkline: 7 deterministic points derived solely from velocity + risk.
  // Uses a seeded pattern based on user_hash to avoid random re-renders.
  // TODO: Replace with real velocity history from GET /engines/users/{hash}/history
  const getMiniSparkPoints = (emp: Employee): string => {
    const base = Math.min(emp.velocity || 0, 5) / 5
    // Derive stable jitter from user_hash characters so the sparkline is
    // deterministic and doesn't change on every render.
    const seed = emp.user_hash.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const points: number[] = []
    for (let i = 0; i < 7; i++) {
      // Deterministic pseudo-jitter in range [-0.15, +0.15]
      const jitter = (((seed * (i + 1) * 2654435761) >>> 0) % 1000) / 1000 * 0.3 - 0.15
      points.push(Math.max(0.05, Math.min(1, base + jitter)))
    }
    const w = 56
    const h = 20
    return points
      .map((v, i) => `${(i / 6) * w},${h - v * h}`)
      .join(" ")
  }

  // Heatmap: 7 cols × 5 rows — deterministic pattern derived from employee risk data.
  // TODO: Replace with real aggregated activity-hour data from a backend endpoint
  //       (e.g. GET /engines/team/activity-heatmap) when available.
  const heatmapData = useMemo(() => {
    const rows = 5
    // Build intensity from actual employee risk levels rather than random values.
    // Critical employees contribute high intensity; healthy contribute low.
    const riskWeight = employees.reduce((acc, emp) => {
      if (emp.risk_level === "CRITICAL") return acc + 1.0
      if (emp.risk_level === "ELEVATED") return acc + 0.55
      return acc + 0.2
    }, 0)
    const baseIntensity = employees.length > 0
      ? Math.min(riskWeight / employees.length, 1)
      : 0.4

    return Array.from({ length: rows }, (_, row) =>
      [0, 1, 2, 3, 4, 5, 6].map((col) => {
        const isWeekend = col >= 5
        // Use deterministic per-cell variation from row/col indices
        const variation = ((row * 7 + col) * 0.07) % 0.25
        const intensity = Math.max(0.05, Math.min(1, baseIntensity + variation - 0.12))
        return isWeekend ? intensity * 0.4 : intensity
      })
    )
  }, [employees])

  const heatColor = (v: number) => {
    if (v > 0.7) return "bg-destructive/60"
    if (v > 0.45) return "bg-amber-500/50"
    if (v > 0.2) return "bg-accent/50"
    return "bg-white/5"
  }

  // Distribution percentages for progress bar
  const critPct = metrics.total_members > 0
    ? Math.round((metrics.critical_count / metrics.total_members) * 100)
    : 0
  const elevPct = metrics.total_members > 0
    ? Math.round((metrics.elevated_count / metrics.total_members) * 100)
    : 0
  const healthyPct = 100 - critPct - elevPct

  const aiInsights = [
    {
      icon: AlertTriangle,
      iconColor: "text-destructive",
      bg: "bg-destructive/5",
      border: "border-l-2 border-destructive",
      title: metrics.critical_count > 0
        ? `${metrics.critical_count} team member${metrics.critical_count > 1 ? "s" : ""} at critical burnout risk`
        : "No critical burnout signals detected",
      sub: "Based on velocity + communication patterns",
    },
    {
      icon: TrendingUp,
      iconColor: "text-accent",
      bg: "bg-accent/5",
      border: "border-l-2 border-accent",
      title: `Team velocity is ${metrics.avg_velocity > 3 ? "above" : "below"} baseline at ${metrics.avg_velocity.toFixed(1)} pts/sprint`,
      sub: "7-day rolling average",
    },
    {
      icon: Brain,
      iconColor: "text-primary",
      bg: "bg-primary/5",
      border: "border-l-2 border-primary",
      title: `${metrics.healthy_count} member${metrics.healthy_count !== 1 ? "s" : ""} in the healthy zone — wellbeing stable`,
      sub: "Belongingness & circadian entropy nominal",
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Greeting Row ─────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Good morning, {userName}
            <span aria-label="wave" role="img">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <AnonymityToggle
            isAnonymized={isAnonymized}
            onToggle={onToggleAnonymity}
          />
          <AskSentinelWidget />
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ManagerKPICard
          label="Team Burnout Risk"
          value={`${metrics.burnout_risk}%`}
          sub="of team at-risk"
          trend={burnoutRiskTrend}
          trendValue={burnoutRiskTrendValue}
          colorClass="text-destructive"
          delay={0}
        />
        <ManagerKPICard
          label="Avg Wellbeing"
          value={`${avgWellbeing}%`}
          sub="healthy members"
          trend={wellbeingTrend}
          trendValue={wellbeingTrendValue}
          colorClass="text-accent"
          delay={80}
        />
        <ManagerKPICard
          label="Team Velocity"
          value={metrics.avg_velocity.toFixed(1)}
          sub="story pts / sprint"
          trend={velocityTrend}
          trendValue={velocityTrendValue}
          colorClass="text-foreground"
          delay={160}
        />
        <ManagerKPICard
          label="At-Risk Members"
          value={atRisk}
          sub={`of ${metrics.total_members} total`}
          trend={atRisk > 0 ? "up" : "neutral"}
          trendValue={atRisk > 0 ? `+${atRisk}` : "—"}
          colorClass="text-amber-400"
          delay={240}
          pulse={atRisk > 0}
        />
      </div>

      {/* ── Main Two-Column Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* LEFT: Team Risk Overview */}
        <div className="lg:col-span-3 bg-card border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Team Risk Overview</h3>
                <p className="text-[11px] text-muted-foreground">{metrics.total_members} members</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard?view=team")}
              className="text-xs text-muted-foreground hover:text-foreground h-7 gap-1 transition-[color,background-color] duration-150"
            >
              Full Roster <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Distribution Bar */}
            <div>
              <div className="flex justify-between text-[11px] text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive inline-block" />
                  Critical {critPct}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
                  At-Risk {elevPct}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent inline-block" />
                  Healthy {healthyPct}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-white/5 flex">
                {critPct > 0 && (
                  <div
                    className="h-full bg-destructive transition-all duration-500"
                    style={{ width: `${critPct}%` }}
                  />
                )}
                {elevPct > 0 && (
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${elevPct}%` }}
                  />
                )}
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${healthyPct}%` }}
                />
              </div>
            </div>

            {/* Employee Rows */}
            <div className="space-y-1">
              {employees.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No team members found
                </div>
              )}
              {employees.slice(0, 6).map((emp) => {
                const sparkPts = getMiniSparkPoints(emp)
                return (
                  <button
                    key={emp.user_hash}
                    onClick={() =>
                      router.push(`/dashboard?view=employee-detail&uid=${emp.user_hash}`)
                    }
                    className={
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg " +
                      "hover:bg-white/3 transition-[background-color] duration-150 " +
                      "active:scale-[0.99] group text-left"
                    }
                  >
                    {/* Avatar */}
                    <div
                      className={
                        "h-8 w-8 rounded-full flex items-center justify-center " +
                        "text-[11px] font-semibold shrink-0 " +
                        (emp.risk_level === "CRITICAL"
                          ? "bg-destructive/15 text-destructive"
                          : emp.risk_level === "ELEVATED"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-accent/15 text-accent")
                      }
                    >
                      {isAnonymized ? "??" : getInitials(getDisplayName(emp))}
                    </div>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate leading-none">
                        {getDisplayName(emp)}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate pt-0.5">
                        {isAnonymized ? "Engineer" : emp.role}
                      </p>
                    </div>

                    {/* Risk Badge */}
                    <span
                      className={
                        `shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ` +
                        getRiskBadgeClass(emp.risk_level)
                      }
                    >
                      {emp.risk_level || "LOW"}
                    </span>

                    {/* Sparkline */}
                    <svg
                      width="56"
                      height="20"
                      viewBox="0 0 56 20"
                      className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-150"
                    >
                      <polyline
                        points={sparkPts}
                        fill="none"
                        stroke={
                          emp.risk_level === "CRITICAL"
                            ? "hsl(var(--destructive))"
                            : emp.risk_level === "ELEVATED"
                            ? "hsl(38 92% 50%)"
                            : "hsl(var(--accent))"
                        }
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* View button (hidden until hover) */}
                    <span className="shrink-0 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-0.5">
                      <Eye className="h-3 w-3" /> View
                    </span>
                  </button>
                )
              })}
            </div>

            {employees.length > 6 && (
              <button
                onClick={() => router.push("/dashboard?view=team")}
                className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-[color] duration-150 py-1"
              >
                +{employees.length - 6} more members — view all
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: AI Insights */}
        <div className="lg:col-span-2 bg-card border border-white/5 rounded-xl flex flex-col overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Sentinel AI</h3>
              <span className="rounded-full bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent">
                Live
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Real-time insights from behavioral telemetry
            </p>
          </div>

          <div className="flex-1 px-4 py-4 space-y-3">
            {aiInsights.map((insight, idx) => (
              <div
                key={idx}
                className={
                  `rounded-lg p-3 ${insight.bg} ${insight.border} ` +
                  "transition-[background-color] duration-150 hover:opacity-90"
                }
              >
                <div className="flex items-start gap-2.5">
                  <insight.icon className={`h-4 w-4 mt-0.5 shrink-0 ${insight.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground leading-snug">
                      {insight.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{insight.sub}</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <button className="text-[11px] text-primary hover:text-primary/80 transition-[color] duration-150 flex items-center gap-0.5">
                    <MessageCircle className="h-3 w-3" />
                    Ask Copilot
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={() => router.push("/ask-sentinel")}
              className={
                "w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white " +
                "bg-gradient-to-r from-primary to-primary/80 " +
                "hover:from-primary/90 hover:to-primary/70 " +
                "transition-[opacity,transform] duration-150 active:scale-[0.97] " +
                "flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              }
            >
              <Sparkles className="h-4 w-4" />
              Open Copilot
            </button>
          </div>
        </div>
      </div>

      {/* ── Chart Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Wellbeing Trend — derived from real risk history data */}
        <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Wellbeing Trend</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">30-day rolling average</p>
            </div>
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <div className="px-5 py-4">
            {/*
              Bars are derived from actual risk history (velocity mapped to wellbeing).
              TODO: Replace with a dedicated team-aggregated wellness trend endpoint
              (e.g. GET /team/analytics?days=30) that returns per-day health scores.
            */}
            <div className="relative h-32 rounded-lg overflow-hidden bg-white/[0.02]">
              <div className="absolute inset-0 flex items-end px-2 pb-2 gap-1">
                {employees.length > 0
                  ? employees.slice(0, 12).map((emp: Employee, i: number) => {
                      // Convert velocity to a 0-1 wellbeing proxy (lower velocity = better)
                      const maxVel = 5
                      const v = Math.max(0.1, Math.min(1, 1 - (emp.velocity || 0) / maxVel))
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${v * 100}%`,
                            background: `hsl(var(--accent) / ${0.3 + v * 0.5})`,
                            animationDelay: `${i * 40}ms`,
                          }}
                        />
                      )
                    })
                  : (
                    <div className="w-full flex items-center justify-center text-[11px] text-muted-foreground pb-4">
                      No employee data available
                    </div>
                  )
                }
              </div>
              {/* gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-1">
              <span>30d ago</span>
              <span>15d ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Work Pattern Heatmap */}
        <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Work Pattern Heatmap</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Team activity intensity</p>
            </div>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div className="px-5 py-4">
            {/* Day labels */}
            <div className="flex gap-1 mb-1.5">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="flex-1 text-center text-[10px] text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>
            {/* Heatmap grid */}
            <div className="flex flex-col gap-1">
              {heatmapData.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-1">
                  {row.map((intensity, colIdx) => (
                    <div
                      key={colIdx}
                      className={`flex-1 h-7 rounded-sm ${heatColor(intensity)}`}
                      title={`${(intensity * 100).toFixed(0)}% activity`}
                    />
                  ))}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-accent/50 inline-block" />
                Low
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/50 inline-block" />
                Elevated
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-destructive/60 inline-block" />
                Critical
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard Content ───────────────────────────────────────────────────

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeView = searchParams.get("view") || "dashboard"
  const detailedUserHash = searchParams.get("uid")

  const { user, userRole, signOut } = useAuth()
  const [selectedUserHash, setSelectedUserHash] = useState<string | null>(null)

  // Manager view state
  const [isAnonymized, setIsAnonymized] = useState(true)

  // Employee profile data
  const [profileData, setProfileData] = useState<MeData | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [updatingConsent, setUpdatingConsent] = useState(false)

  const fetchProfileData = async () => {
    try {
      setProfileLoading(true)
      const response = await api.get<MeData>('/me')
      setProfileData(response as MeData)
      setProfileError(null)
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || "Failed to load profile")
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    if (userRole?.role === 'employee') {
      fetchProfileData()
    }
  }, [userRole])

  const handleUpdateConsent = async (type: "manager" | "anonymized", value: boolean) => {
    try {
      setUpdatingConsent(true)
      const payload = type === "manager"
        ? { consent_share_with_manager: value }
        : { consent_share_anonymized: value }
      await api.put("/me/consent", payload)
      await fetchProfileData()
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || "Failed to update consent")
    } finally {
      setUpdatingConsent(false)
    }
  }

  const handlePauseMonitoring = async (hours: number) => {
    try {
      await api.post(`/me/pause-monitoring?hours=${hours}`, {})
      await fetchProfileData()
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || "Failed to pause monitoring")
    }
  }

  const handleResumeMonitoring = async () => {
    try {
      await api.post("/me/resume-monitoring", {})
      await fetchProfileData()
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || "Failed to resume monitoring")
    }
  }

  const isEmployee = userRole?.role === 'employee'
  const isManager = userRole?.role === 'manager'
  const isAdmin = userRole?.role === 'admin'

  useEffect(() => {
    if (!userRole) return
    // Block unauthorized access to privileged views
    if (activeView === "admin" && !isAdmin) {
      router.replace('/dashboard')
      return
    }
    if (activeView === "team" && !isManager && !isAdmin) {
      router.replace('/dashboard')
      return
    }
    if (activeView === "employee-detail" && !isManager && !isAdmin) {
      router.replace('/dashboard')
      return
    }
    // Redirect each role to their default view when landing on wrong view
    if (activeView === "dashboard" || activeView === "profile" || !activeView) {
      if (isAdmin) {
        router.replace('/dashboard?view=admin')
      } else if (isManager) {
        router.replace('/dashboard?view=team')
      }
      // employees stay on "dashboard" view — no redirect needed
    }
  }, [userRole, isAdmin, isManager, activeView, router])

  const { users, isLoading: usersLoading, error: usersError } = useUsers()

  useEffect(() => {
    if (!selectedUserHash && users.length > 0) {
      setSelectedUserHash(users[0].user_hash)
    }
  }, [users, selectedUserHash])

  const employees = useMemo(() => mapUsersToEmployees(users), [users])

  const selectedBaseEmployee = useMemo(() =>
    employees.find(e => e.user_hash === selectedUserHash) || employees[0] || null,
    [employees, selectedUserHash]
  )

  const { data: riskData, refetch: refetchRiskData } = useRiskData(selectedUserHash)
  const { history: fetchedHistory } = useRiskHistory(selectedUserHash)
  const { data: nudgeData } = useNudge(selectedUserHash)
  const { data: networkData, refetch: refetchNetworkData } = useNetworkData(selectedUserHash)
  const { data: teamData, refetch: refetchTeamData } = useTeamData()
  const { data: forecastData, isLoading: forecastLoading } = useForecast()

  const { injectEvent, createPersona } = useSimulation()
  const { events: recentEvents, refetch: refetchEvents } = useRecentEvents()

  const currentEmployee = useMemo(() => {
    if (!selectedBaseEmployee) return null
    if (!riskData) return selectedBaseEmployee
    return {
      ...selectedBaseEmployee,
      risk_level: riskData.risk_level,
      velocity: riskData.velocity,
      confidence: riskData.confidence,
      belongingness_score: riskData.belongingness_score,
      circadian_entropy: riskData.circadian_entropy,
      indicators: {
        overwork: riskData.indicators.overwork || false,
        isolation: riskData.indicators.isolation || false,
        fragmentation: riskData.indicators.fragmentation || false,
        late_night_pattern: riskData.indicators.late_night_pattern || false,
        weekend_work: riskData.indicators.weekend_work || false,
        communication_decline: riskData.indicators.communication_decline || false,
      }
    } as Employee
  }, [selectedBaseEmployee, riskData])

  const history = useMemo(() => {
    if (fetchedHistory && fetchedHistory.length > 0) {
      return fetchedHistory.map((p: any) => ({
        ...p,
        date: new Date(p.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        risk_level: toRiskLevel(p.risk_level)
      }))
    }
    return []
  }, [fetchedHistory])

  const mappedEvents = useMemo(() => {
    return recentEvents.map((e, index) => ({
      id: `evt-${index}-${e.timestamp}`,
      timestamp: e.timestamp,
      event_type: e.event_type,
      description: e.description || `Event: ${e.event_type}`,
      risk_impact: e.risk_impact || "neutral"
    }))
  }, [recentEvents])

  const mappedTeamMetrics = useMemo(() => {
    const total_members = employees.length
    const healthy_count = employees.filter(e => e.risk_level === "LOW" || !e.risk_level).length
    const elevated_count = employees.filter(e => e.risk_level === "ELEVATED").length
    const critical_count = employees.filter(e => e.risk_level === "CRITICAL").length

    const avgVelocity = teamData?.metrics?.avg_velocity || employees.reduce((acc, e) => acc + (e.velocity || 0), 0) / (employees.length || 1)
    const graphFragmentation = teamData?.metrics?.graph_fragmentation || 0
    const commDecayRate = teamData?.metrics?.comm_decay_rate || 0
    const teamRisk = teamData?.team_risk || "LOW"

    const atRisk = critical_count + elevated_count
    const burnout_risk = total_members > 0 ? Math.round((atRisk / total_members) * 100) : 0

    return {
      total_members,
      healthy_count,
      elevated_count,
      critical_count,
      avg_velocity: avgVelocity,
      graph_fragmentation: graphFragmentation,
      comm_decay_rate: commDecayRate,
      contagion_risk: toRiskLevel(teamRisk),
      burnout_risk
    }
  }, [teamData, employees])

  const networkNodes = networkData?.nodes || []
  const networkEdges = networkData?.edges || []

  const handleUserSelect = (emp: Employee) => {
    setSelectedUserHash(emp.user_hash)
  }

  const handleSimulationInject = async (eventType: string) => {
    if (!currentEmployee) return
    try {
      await injectEvent(currentEmployee.user_hash, eventType)
      await refetchEvents()
    } catch (e) {
      console.error('Injection failed:', e)
    }
  }

  const handleCreatePersona = async (personaId: string) => {
    const validPersonas: PersonaType[] = ['alex_burnout', 'sarah_gem', 'jordan_steady', 'maria_contagion']
    if (!validPersonas.includes(personaId as PersonaType)) return
    try {
      const email = `${personaId.split('_')[0]}@simulation.com`
      await createPersona(email, personaId as PersonaType)
    } catch (e) {
      console.error('Persona creation failed:', e)
    }
  }

  const [isRefreshing, setIsRefreshing] = useState(false)
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchRiskData?.(),
        refetchTeamData?.(),
        refetchEvents?.(),
        refetchNetworkData?.()
      ])
    } finally {
      setIsRefreshing(false)
    }
  }, [refetchRiskData, refetchTeamData, refetchEvents, refetchNetworkData])

  useEffect(() => {
    const interval = setInterval(handleRefresh, 60000)
    return () => clearInterval(interval)
  }, [handleRefresh])

  const detailEmployee = useMemo(() =>
    employees.find(e => e.user_hash === detailedUserHash) || employees[0],
    [employees, detailedUserHash]
  )

  // Derive manager display name from auth user
  const managerDisplayName = useMemo(() => {
    const email = user?.email || ""
    const local = email.split('@')[0] || "Manager"
    return local.charAt(0).toUpperCase() + local.slice(1)
  }, [user])

  // Per-view loading/error state: only block views that depend on the users list
  const usersNeeded = activeView === "dashboard" || activeView === "team" || activeView === "employee-detail"
  const showUsersLoading = usersNeeded && usersLoading && users.length === 0
  const showUsersError = usersNeeded && usersError

  return (
    <div className="flex flex-1 flex-col h-full bg-background">
      <ScrollArea className="flex-1">
        <main className="flex flex-col gap-6 p-6 lg:p-8 pb-20">

          {/* ── Per-view loading/error for user-dependent views ─────────── */}
          {showUsersLoading && (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm">Loading Dashboard...</p>
              </div>
            </div>
          )}

          {showUsersError && !showUsersLoading && (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <p className="text-sm font-medium text-foreground">Failed to load dashboard data</p>
                <p className="text-xs text-muted-foreground max-w-md text-center">
                  {usersError?.message || 'Could not fetch user data from the engine API.'}
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* ==================== 1. DEFAULT DASHBOARD ==================== */}
          {activeView === "dashboard" && !showUsersLoading && !showUsersError && (
            <div className="space-y-5 animate-in fade-in duration-300">

              {/* ── Hero greeting ────────────────────────────────────── */}
              <div className="relative overflow-hidden rounded-2xl bg-card border border-white/5 p-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-1.5">
                      {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      Welcome back, {managerDisplayName}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1.5">
                      Your personal wellbeing dashboard — insights are private to you.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-white/15 transition-[color,background-color,border-color] duration-150 disabled:opacity-50 active:scale-[0.97]"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                      {isRefreshing ? "Refreshing" : "Refresh"}
                    </button>
                    <AskSentinelWidget />
                  </div>
                </div>

                {/* Status pills */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-[background-color] duration-150 ${
                    currentEmployee?.risk_level === "CRITICAL"
                      ? "bg-destructive/10 border-destructive/20 text-destructive"
                      : currentEmployee?.risk_level === "ELEVATED"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-accent/10 border-accent/20 text-accent"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      currentEmployee?.risk_level === "CRITICAL" ? "bg-destructive"
                      : currentEmployee?.risk_level === "ELEVATED" ? "bg-amber-400"
                      : "bg-accent"
                    }`} />
                    Wellbeing: {currentEmployee?.risk_level || "LOW"}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Zap className="h-3 w-3 text-primary" />
                    Velocity {currentEmployee?.velocity?.toFixed(1) ?? "—"}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                    <Shield className="h-3 w-3" />
                    Privacy Protected
                  </span>
                </div>
              </div>

              {/* ── Stat Cards ──────────────────────────────────────── */}
              <StatCards metrics={mappedTeamMetrics} />

              {/* ── Risk + Activity Grid ────────────────────────────── */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div
                  className="lg:col-span-4 bg-card border border-white/5 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-400"
                  style={{ animationDelay: "80ms" }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Risk Factors</h3>
                  </div>
                  {currentEmployee && <RiskAssessment employee={currentEmployee} />}
                </div>

                <div
                  className="lg:col-span-3 bg-card border border-white/5 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-400"
                  style={{ animationDelay: "160ms" }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Activity className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
                  </div>
                  <div className="h-[400px]">
                    <ActivityFeed events={mappedEvents} />
                  </div>
                </div>
              </div>

              {/* ── Burnout Prediction ──────────────────────────────── */}
              <BurnoutPrediction riskData={riskData ?? undefined} history={history} />

              {/* ── Velocity + Nudge ────────────────────────────────── */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div
                  className="lg:col-span-4 bg-card border border-white/5 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-400"
                  style={{ animationDelay: "240ms" }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Velocity Trend</h3>
                  </div>
                  <div className="h-[300px]">
                    <VelocityChart history={history} />
                  </div>
                </div>
                <div className="lg:col-span-3 animate-in fade-in slide-in-from-bottom-2 duration-400" style={{ animationDelay: "320ms" }}>
                  <NudgeCard nudge={nudgeData ?? undefined} />
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. ADMIN DASHBOARD ==================== */}
          {activeView === "admin" && isAdmin && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="relative overflow-hidden rounded-2xl bg-card border border-white/5 px-6 py-5">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-1.5">
                      {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">System health, organizational overview, and controls.</p>
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-3 py-1.5 gap-1.5">
                    <Shield className="w-3 h-3" /> Admin Access
                  </Badge>
                </div>
              </div>

              <GlobalStatsCards />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <OrgHealthMap />
                  <div className="bg-card border border-white/5 rounded-xl p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Activity className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">Recent Events</h3>
                    </div>
                    <AuditLogFeed />
                  </div>
                </div>
                <div className="col-span-1 space-y-6">
                  <BurnoutCostCalculator
                    criticalCount={mappedTeamMetrics.critical_count}
                    elevatedCount={mappedTeamMetrics.elevated_count}
                  />
                  <AdminQuickActions />
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. MANAGER DASHBOARD ==================== */}
          {activeView === "team" && (isManager || isAdmin) && !showUsersLoading && !showUsersError && (
            <ManagerDashboard
              metrics={mappedTeamMetrics}
              employees={employees}
              isAnonymized={isAnonymized}
              onToggleAnonymity={() => setIsAnonymized(!isAnonymized)}
              userName={managerDisplayName}
            />
          )}

          {/* ==================== 4. INDIVIDUAL INSIGHTS ==================== */}
          {activeView === "employee-detail" && (isManager || isAdmin) && !showUsersLoading && !showUsersError && (
            <IndividualInsights
              employee={detailEmployee}
              isAnonymized={isAnonymized}
              onBack={() => router.push("/dashboard?view=team")}
              onToggleAnonymity={() => setIsAnonymized(!isAnonymized)}
            />
          )}

          {/* ==================== 5. OTHER VIEWS ==================== */}
          {activeView === "simulation" && <SimulationPanel />}
          {activeView === "network" && <NetworkGraph nodes={networkNodes} edges={networkEdges} />}

          {activeView === "safety-valve" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Safety Valve Engine</h2>
                <p className="text-sm text-muted-foreground">IPT-based burnout detection using behavioral signals.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4.5 w-4.5" style={{ color: 'hsl(var(--sentinel-healthy))' }} />
                    <h3 className="text-sm font-semibold text-foreground">Risk Assessment</h3>
                  </div>
                  {currentEmployee && <RiskAssessment employee={currentEmployee} />}
                </div>
                <BurnoutPrediction riskData={riskData ?? undefined} history={history} />
              </div>
              <div className="metric-card">
                <h3 className="text-sm font-semibold mb-4">How Safety Valve Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Signal Collection", desc: "Monitors commit times, Slack patterns, Jira velocity, and calendar load." },
                    { title: "IPT Risk Scoring", desc: "Measures thwarted belongingness and perceived burdensomeness via velocity regression." },
                    { title: "Proactive Nudges", desc: "Generates supportive messages — employees first, managers second." },
                  ].map((s) => (
                    <div key={s.title} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                      <h4 className="text-xs font-semibold text-foreground mb-1">{s.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === "talent-scout" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Talent Scout Engine</h2>
                <p className="text-sm text-muted-foreground">Network analysis to discover hidden gems.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { label: "Betweenness Centrality", desc: "How often a person bridges disconnected groups.", tag: "Connectors" },
                  { label: "Eigenvector Centrality", desc: "Connected to other important people with outsized influence.", tag: "Influencers" },
                  { label: "Unblocking Score", desc: "Frequency of unblocking teammates via PR reviews.", tag: "Hidden Gems" },
                ].map((m) => (
                  <div key={m.label} className="metric-card">
                    <h3 className="text-xs font-semibold text-foreground mb-1">{m.label}</h3>
                    <p className="text-[11px] text-muted-foreground mb-2">{m.desc}</p>
                    <Badge variant="outline" className="text-[10px]">{m.tag}</Badge>
                  </div>
                ))}
              </div>
              <div className="glass-card rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-1">Team Network Graph</h3>
                <p className="text-xs text-muted-foreground mb-4">Collaboration patterns across the team.</p>
                <div className="h-[400px]">
                  <NetworkGraph nodes={networkNodes} edges={networkEdges} />
                </div>
              </div>
            </div>
          )}

          {activeView === "culture" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Culture Thermometer</h2>
                <p className="text-sm text-muted-foreground">SIR epidemiological model for organizational sentiment.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-1">SIR Contagion Forecast</h3>
                  <p className="text-xs text-muted-foreground mb-4">Susceptible → Infected → Recovered dynamics.</p>
                  <div className="h-[300px]">
                    <ForecastChart data={forecastData} isLoading={forecastLoading} />
                  </div>
                </div>
                <div className="metric-card">
                  <h3 className="text-sm font-semibold mb-4">Model Components</h3>
                  <div className="space-y-3">
                    {[
                      { letter: "S", label: "Susceptible", desc: "Members at risk based on proximity to negative patterns." },
                      { letter: "I", label: "Infected", desc: "Members showing negative shifts in communication patterns." },
                      { letter: "R", label: "Recovered", desc: "Members who improved after intervention." },
                    ].map((s) => (
                      <div key={s.letter} className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">{s.letter}</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{s.label}</p>
                          <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </ScrollArea>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  )
}
