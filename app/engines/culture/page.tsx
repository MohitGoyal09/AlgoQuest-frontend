"use client"

import { useState, useMemo } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  Smile,
  Frown,
  Meh,
  Users,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  HeartHandshake,
  MessageCircle,
  Sparkles,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Info,
  Clock,
  MessageSquare,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { useUsers } from "@/hooks/useUsers"
import { useTeamData } from "@/hooks/useTeamData"
import { cn } from "@/lib/utils"

// ─── Health score cards ──────────────────────────────────────────────────────

function HealthScoreCard({
  label,
  value,
  unit,
  color,
  icon: Icon,
  sub,
}: {
  label: string
  value: string | number
  unit?: string
  color: string
  icon: React.ElementType
  sub?: string
}) {
  return (
    <div className="bg-card border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className={cn("text-2xl font-bold font-mono", color)}>{value}</span>
        {unit && <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>}
      </div>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

// ─── Mood SVG Line Chart ─────────────────────────────────────────────────────

const MOOD_POINTS = [62, 68, 58, 72, 65, 78, 74, 80, 71, 76, 69, 73, 82, 77, 85, 79, 88, 83, 91, 86, 90, 84, 92, 88, 95, 89, 93, 97, 91, 96]
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr"]

function MoodLineChart() {
  const W = 600; const H = 140; const PAD = { t: 16, r: 16, b: 30, l: 36 }
  const chartW = W - PAD.l - PAD.r
  const chartH = H - PAD.t - PAD.b
  const minV = 40; const maxV = 100

  const pts = MOOD_POINTS.map((v, i) => ({
    x: PAD.l + (i / (MOOD_POINTS.length - 1)) * chartW,
    y: PAD.t + chartH - ((v - minV) / (maxV - minV)) * chartH,
  }))

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const areaD = `${pathD} L${pts[pts.length - 1].x},${H - PAD.b} L${pts[0].x},${H - PAD.b} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Y grid lines */}
      {[40, 60, 80, 100].map((v) => {
        const y = PAD.t + chartH - ((v - minV) / (maxV - minV)) * chartH
        return (
          <g key={v}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3 3" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{v}</text>
          </g>
        )
      })}
      {/* Month labels */}
      {MONTH_LABELS.map((m, i) => {
        const x = PAD.l + (i / (MONTH_LABELS.length - 1)) * chartW
        return <text key={m} x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{m}</text>
      })}
      {/* Area fill */}
      <path d={areaD} fill="url(#moodGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Last point dot */}
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4" fill="hsl(var(--accent))" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="7" fill="hsl(var(--accent))" fillOpacity="0.25" />
    </svg>
  )
}

// ─── GitHub-style sentiment calendar ─────────────────────────────────────────

const WEEKS = 16
const CAL_DAYS = WEEKS * 7

function getCalColor(v: number): string {
  if (v > 0.8) return "bg-accent"
  if (v > 0.6) return "bg-accent/60"
  if (v > 0.4) return "bg-accent/35"
  if (v > 0.2) return "bg-accent/15"
  return "bg-white/5"
}

// Deterministic values — avoid Math.random for SSR safety
const CAL_VALUES = Array.from({ length: CAL_DAYS }, (_, i) => {
  const base = 0.4 + (i % 5) * 0.08 + (i % 7 < 5 ? 0.1 : -0.1)
  return Math.max(0, Math.min(1, base))
})

const CAL_MONTH_LABELS = ["Oct", "Nov", "Dec", "Jan"]

// ─── Culture Content ─────────────────────────────────────────────────────────

function CultureContent() {
  const { users, isLoading: usersLoading } = useUsers()
  const { data: teamData, isLoading: teamLoading, refetch } = useTeamData()

  const metrics = teamData?.metrics

  // Culture temperature
  const cultureTemperature = useMemo(() => {
    if (!metrics) return null
    const fragPenalty = (metrics.graph_fragmentation ?? 0) * 30
    const velocityBonus = Math.min((metrics.avg_velocity ?? 0) * 0.5, 40)
    const critPenalty = Math.min((metrics.critical_members ?? metrics.critical_count ?? 0) * 5, 25)
    const temp = Math.max(0, Math.min(100, 50 + velocityBonus - fragPenalty - critPenalty))
    let status: "hot" | "warm" | "cool" | "cold"
    let message: string
    if (temp >= 75) { status = "hot"; message = "Team culture is thriving" }
    else if (temp >= 55) { status = "warm"; message = "Healthy team culture with room to grow" }
    else if (temp >= 35) { status = "cool"; message = "Culture needs attention" }
    else { status = "cold"; message = "Critical: Culture intervention needed" }
    return { value: temp, status, message }
  }, [metrics])

  // Team sentiment
  const teamSentiment = useMemo(() => {
    if (!metrics) return null
    const totalMembers = metrics.total_members ?? metrics.team_size ?? metrics.member_count ?? users.length
    const critCount = metrics.critical_members ?? metrics.critical_count ?? 0
    const positiveRatio = totalMembers > 0 ? Math.max(0, (totalMembers - critCount) / totalMembers) : 0
    const score = Math.round(positiveRatio * 100)
    let overall: "positive" | "neutral" | "negative"
    if (score >= 70) overall = "positive"
    else if (score >= 40) overall = "neutral"
    else overall = "negative"
    const positivePercent = Math.round(positiveRatio * 100)
    const negativePercent = Math.round((critCount / Math.max(totalMembers, 1)) * 100)
    const neutralPercent = Math.max(0, 100 - positivePercent - negativePercent)
    return { overall, score, breakdown: { positive: positivePercent, neutral: neutralPercent, negative: negativePercent } }
  }, [metrics, users.length])

  // Top collaborators (derived from users if available)
  const topCollaborators = useMemo(() => {
    return users.slice(0, 5).map((u, i) => ({
      name: u.name || `User ${i + 1}`,
      score: Math.max(10, 95 - i * 12),
      trend: i < 2 ? "up" : i === 2 ? "flat" : "down",
      rising: i === 1,
    }))
  }, [users])

  const isLoading = usersLoading || teamLoading

  const psychSafety = cultureTemperature ? Math.min(10, cultureTemperature.value / 10).toFixed(1) : "--"
  const belonging = teamSentiment ? `${teamSentiment.breakdown.positive}%` : "--"
  const collabScore = metrics ? Math.min(10, (metrics.avg_velocity ?? 0) / 10).toFixed(1) : "--"
  const alignment = cultureTemperature ? `${cultureTemperature.value.toFixed(0)}%` : "--"

  const alertSeverityColor = (sev: "critical" | "warning" | "info") => {
    if (sev === "critical") return "bg-destructive/5 border border-destructive/10"
    if (sev === "warning") return "bg-[hsl(var(--sentinel-elevated))]/5 border border-[hsl(var(--sentinel-elevated))]/10"
    return "bg-white/5 border border-white/5"
  }

  const cultureAlerts = [
    { text: "Communication decay rate rising in Eng cluster", sev: "critical" as const },
    { text: "2 team members show isolation patterns", sev: "warning" as const },
    { text: "Collaboration velocity above baseline — great sign", sev: "info" as const },
  ]

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-col gap-5 p-4 lg:p-6">

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Manrope',sans-serif] text-foreground">Culture Engine</h1>
              <p className="text-sm text-muted-foreground">Team sentiment &amp; workplace wellness</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground bg-white/5 border border-white/5 rounded-full px-3 py-1">
              Last analyzed 2 hours ago
            </span>
            <Badge className="gap-1 text-[10px] bg-accent/10 text-accent border border-accent/20">
              <Activity className="h-3 w-3" />
              Live
            </Badge>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Run Analysis
            </Button>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-white/10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* ── Health Score Row ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <HealthScoreCard
                label="Psychological Safety"
                value={psychSafety}
                unit="/10"
                color="text-accent"
                icon={Heart}
                sub="Based on communication patterns"
              />
              <HealthScoreCard
                label="Belonging Index"
                value={belonging}
                color="text-primary"
                icon={Users}
                sub="Team inclusion score"
              />
              <HealthScoreCard
                label="Collaboration Score"
                value={collabScore}
                unit="/10"
                color={
                  metrics && (metrics.avg_velocity ?? 0) < 40
                    ? "text-[hsl(var(--sentinel-elevated))]"
                    : "text-accent"
                }
                icon={HeartHandshake}
                sub="Avg cross-team velocity"
              />
              <HealthScoreCard
                label="Cultural Alignment"
                value={alignment}
                color="text-accent"
                icon={Activity}
                sub="Culture temperature index"
              />
            </div>

            {/* ── Main Grid: 5 cols ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

              {/* Left: col-span-3 */}
              <div className="lg:col-span-3 space-y-5">

                {/* Mood Trends */}
                <div className="bg-card border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Mood Trends
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        Sentiment Score
                      </span>
                      <span className="text-xs text-muted-foreground bg-accent/10 text-accent border border-accent/20 rounded-full px-2 py-0.5">
                        +{teamSentiment ? (teamSentiment.score - 60).toFixed(0) : "12"}% vs last quarter
                      </span>
                    </div>
                  </div>
                  <MoodLineChart />
                  <div className="flex items-center justify-between mt-2">
                    {["Oct", "Nov", "Dec", "Jan"].map((m) => (
                      <span key={m} className="text-[10px] text-muted-foreground">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Collaboration Network placeholder */}
                <div className="bg-card border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-[hsl(var(--sentinel-info))]" />
                      Collaboration Network
                    </h3>
                    <span className="text-[10px] text-muted-foreground bg-white/5 border border-white/5 rounded-full px-2 py-0.5">
                      {users.length} nodes
                    </span>
                  </div>
                  {/* SVG network visualization */}
                  <svg viewBox="0 0 400 180" className="w-full h-auto">
                    <defs>
                      <radialGradient id="netBg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width="400" height="180" fill="url(#netBg)" rx="8" />
                    {/* Edges */}
                    {[
                      [200, 90, 100, 45], [200, 90, 300, 45], [200, 90, 80, 130],
                      [200, 90, 320, 130], [200, 90, 200, 155], [100, 45, 80, 130],
                      [300, 45, 320, 130], [80, 130, 200, 155], [320, 130, 200, 155],
                      [100, 45, 40, 65], [300, 45, 360, 65]
                    ].map(([x1, y1, x2, y2], i) => (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--border))" strokeWidth="1" />
                    ))}
                    {/* Satellite nodes */}
                    {[[100, 45, 8, "text-primary"], [300, 45, 8, "text-accent"], [80, 130, 7, "text-[hsl(var(--sentinel-info))]"],
                      [320, 130, 7, "text-muted-foreground"], [200, 155, 6, "text-muted-foreground"],
                      [40, 65, 5, "text-muted-foreground"], [360, 65, 5, "text-muted-foreground"]
                    ].map(([cx, cy, r, _c], i) => (
                      <circle key={i} cx={cx as number} cy={cy as number} r={r as number}
                        fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
                    ))}
                    {/* Central node */}
                    <circle cx="200" cy="90" r="18" fill="hsl(var(--primary)/0.15)" stroke="hsl(var(--primary))" strokeWidth="2" />
                    <circle cx="200" cy="90" r="26" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.4" />
                    <text x="200" y="94" textAnchor="middle" fontSize="8" fill="hsl(var(--primary))" fontWeight="700">TEAM</text>
                  </svg>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-muted-foreground">
                      Density: <span className="text-foreground font-medium">
                        {metrics ? `${((1 - (metrics.graph_fragmentation ?? 0)) * 100).toFixed(0)}%` : "--"}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Fragmentation: <span className="text-foreground font-medium">
                        {metrics ? `${((metrics.graph_fragmentation ?? 0) * 100).toFixed(1)}%` : "--"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: col-span-2 */}
              <div className="lg:col-span-2 space-y-5">

                {/* Top Collaborators */}
                <div className="bg-card border border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Top Collaborators
                  </h3>
                  {topCollaborators.length > 0 ? (
                    <div className="space-y-3">
                      {topCollaborators.map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-foreground truncate">{c.name}</span>
                              {c.rising && (
                                <span className="text-[9px] bg-accent/15 text-accent border border-accent/20 rounded-full px-1.5 py-0.5 shrink-0">
                                  Rising Star
                                </span>
                              )}
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${c.score}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {c.trend === "up" ? (
                              <TrendingUp className="h-3 w-3 text-accent" />
                            ) : c.trend === "down" ? (
                              <TrendingDown className="h-3 w-3 text-destructive" />
                            ) : (
                              <span className="h-3 w-3 flex items-center justify-center">
                                <span className="h-0.5 w-2.5 bg-muted-foreground rounded" />
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground font-mono">{c.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 gap-2 border border-dashed border-border rounded-lg">
                      <Users className="h-6 w-6 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">No collaborator data yet</p>
                    </div>
                  )}
                </div>

                {/* Culture Alerts */}
                <div className="bg-card border border-white/5 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-[10px] font-bold">
                      S
                    </div>
                    <span className="text-sm font-medium text-foreground">Culture Alerts</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse ml-auto" />
                  </div>
                  <div className="space-y-2">
                    {cultureAlerts.map((alert, i) => (
                      <div key={i} className={cn("rounded-lg p-3", alertSeverityColor(alert.sev))}>
                        <div className="flex items-start gap-2">
                          <AlertCircle className={cn(
                            "h-3.5 w-3.5 mt-0.5 shrink-0",
                            alert.sev === "critical" ? "text-destructive" :
                            alert.sev === "warning" ? "text-[hsl(var(--sentinel-elevated))]" :
                            "text-muted-foreground"
                          )} />
                          <p className="text-xs text-foreground/80 flex-1 leading-snug">{alert.text}</p>
                        </div>
                        {alert.sev !== "info" && (
                          <button className="mt-2 text-[10px] border border-white/10 rounded px-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors active:scale-[0.97]">
                            Investigate
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sentiment Breakdown */}
                {teamSentiment && (
                  <div className="bg-card border border-white/5 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-destructive" />
                      Sentiment Breakdown
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Overall</span>
                      <span className="text-sm font-bold font-mono text-destructive">{teamSentiment.score}/100</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-destructive rounded-full transition-all duration-500" style={{ width: `${teamSentiment.score}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Positive", value: teamSentiment.breakdown.positive, icon: Smile, color: "text-accent" },
                        { label: "Neutral", value: teamSentiment.breakdown.neutral, icon: Meh, color: "text-[hsl(var(--sentinel-elevated))]" },
                        { label: "Negative", value: teamSentiment.breakdown.negative, icon: Frown, color: "text-destructive" },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-2 rounded-lg bg-white/5">
                          <s.icon className={cn("h-5 w-5 mx-auto mb-1", s.color)} />
                          <p className={cn("text-base font-bold font-mono", s.color)}>{s.value}%</p>
                          <p className="text-[9px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sentiment Calendar ─────────────────────────────────────── */}
            <div className="bg-card border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />
                  Sentiment Calendar
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-white/5" />Low</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-accent/35" />Mid</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-accent" />High</span>
                </div>
              </div>
              {/* Month labels */}
              <div className="flex gap-1 mb-1 overflow-x-auto">
                {CAL_MONTH_LABELS.map((m, i) => (
                  <div key={m} className="text-[9px] text-muted-foreground" style={{ width: `${(WEEKS / CAL_MONTH_LABELS.length) * 13}px` }}>
                    {m}
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <div
                  className="grid gap-0.5"
                  style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`, gridTemplateRows: "repeat(7, 1fr)" }}
                >
                  {CAL_VALUES.map((v, i) => {
                    const week = Math.floor(i / 7)
                    const day = i % 7
                    return (
                      <div
                        key={i}
                        className={cn("h-3 w-3 rounded-sm transition-colors", getCalColor(v))}
                        style={{ gridColumn: week + 1, gridRow: day + 1 }}
                        title={`Week ${week + 1} Day ${day + 1}: ${(v * 100).toFixed(0)}%`}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Sentiment index derived from communication velocity and risk distribution</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-4 py-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><Info className="h-3 w-3" />Refreshed every 5 minutes</span>
              <span className="h-3 border-l border-border" />
              <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </>
        )}
      </main>
    </ScrollArea>
  )
}

export default function CultureEnginePage() {
  return <CultureContent />
}
