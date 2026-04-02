"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"

import { SkillsRadar } from "@/components/skills-radar"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Users,
  TrendingUp,
  Award,
  Gem,
  RefreshCw,
  ChevronRight,
  Star,
  Crown,
  ArrowUpRight,
  BarChart3,
  Info,
  Clock,
  Zap,
  Play,
  AlertTriangle,
  Shield,
  Target,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

import { Employee, RiskLevel, toRiskLevel, NetworkNode } from "@/types"
import { mapUsersToEmployees } from "@/lib/map-employees"
import { useGlobalNetworkData } from "@/hooks/useGlobalNetworkData"
import { useTeamData } from "@/hooks/useTeamData"
import { useUsers } from "@/hooks/useUsers"
import { cn, getInitials } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TalentProfile {
  user_hash: string
  name: string
  role: string
  skills: {
    technical: number
    communication: number
    leadership: number
    collaboration: number
    adaptability: number
    creativity: number
  }
  betweenness: number
  eigenvector: number
  unblocking: number
  is_hidden_gem: boolean
  potential_score: number
  visibility_score: number
}

// ─── Talent Quadrant SVG ─────────────────────────────────────────────────────

interface QuadrantProps {
  profiles: TalentProfile[]
}

function TalentQuadrant({ profiles }: QuadrantProps) {
  const W = 360; const H = 260; const PAD = 40
  const chartW = W - PAD * 2
  const chartH = H - PAD * 2

  // Map performance=betweenness (x), potential=eigenvector (y)
  const maxB = Math.max(0.001, ...profiles.map(p => p.betweenness))
  const maxE = Math.max(0.001, ...profiles.map(p => p.eigenvector))

  const cx = (b: number) => PAD + (b / maxB) * chartW
  const cy = (e: number) => PAD + chartH - (e / maxE) * chartH

  const quadrantLabels = [
    { x: PAD + chartW * 0.75, y: PAD + chartH * 0.25, label: "Stars", color: "hsl(var(--accent))" },
    { x: PAD + chartW * 0.25, y: PAD + chartH * 0.25, label: "High Potentials", color: "hsl(var(--primary))" },
    { x: PAD + chartW * 0.75, y: PAD + chartH * 0.75, label: "Core Players", color: "hsl(var(--sentinel-info))" },
    { x: PAD + chartW * 0.25, y: PAD + chartH * 0.75, label: "Developing", color: "hsl(var(--muted-foreground))" },
  ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Quadrant backgrounds */}
      <rect x={PAD + chartW / 2} y={PAD} width={chartW / 2} height={chartH / 2} fill="hsl(var(--accent))" fillOpacity="0.04" />
      <rect x={PAD} y={PAD} width={chartW / 2} height={chartH / 2} fill="hsl(var(--primary))" fillOpacity="0.04" />
      <rect x={PAD + chartW / 2} y={PAD + chartH / 2} width={chartW / 2} height={chartH / 2} fill="hsl(var(--sentinel-info))" fillOpacity="0.03" />
      <rect x={PAD} y={PAD + chartH / 2} width={chartW / 2} height={chartH / 2} fill="hsl(var(--muted))" fillOpacity="0.03" />
      {/* Grid lines */}
      <line x1={PAD + chartW / 2} y1={PAD} x2={PAD + chartW / 2} y2={PAD + chartH} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
      <line x1={PAD} y1={PAD + chartH / 2} x2={PAD + chartW} y2={PAD + chartH / 2} stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
      {/* Axes */}
      <line x1={PAD} y1={PAD + chartH} x2={PAD + chartW} y2={PAD + chartH} stroke="hsl(var(--border))" strokeWidth="1" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + chartH} stroke="hsl(var(--border))" strokeWidth="1" />
      {/* Axis labels */}
      <text x={PAD + chartW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">Performance</text>
      <text x={8} y={PAD + chartH / 2} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" transform={`rotate(-90,8,${PAD + chartH / 2})`}>Potential</text>
      {/* Quadrant labels */}
      {quadrantLabels.map((q) => (
        <text key={q.label} x={q.x} y={q.y} textAnchor="middle" fontSize="8" fill={q.color} fontWeight="600" opacity="0.7">
          {q.label}
        </text>
      ))}
      {/* Employee dots */}
      {profiles.map((p) => {
        const x = cx(p.betweenness)
        const y = cy(p.eigenvector)
        const color = p.is_hidden_gem
          ? "hsl(var(--sentinel-gem))"
          : p.betweenness > maxB * 0.5 && p.eigenvector > maxE * 0.5
          ? "hsl(var(--accent))"
          : p.betweenness > maxB * 0.5
          ? "hsl(var(--sentinel-info))"
          : p.eigenvector > maxE * 0.5
          ? "hsl(var(--primary))"
          : "hsl(var(--muted-foreground))"
        return (
          <g key={p.user_hash}>
            <circle cx={x} cy={y} r="7" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
            <text x={x} y={y + 3.5} textAnchor="middle" fontSize="6" fill={color} fontWeight="700">
              {getInitials(p.name)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Skill Coverage Heatmap ───────────────────────────────────────────────────

const SKILLS_COLS = ["Technical", "Leadership", "Collab", "Communication", "Innovation"]

function getCellClass(value: number): string {
  if (value > 70) return "bg-accent/60 text-accent"
  if (value > 45) return "bg-primary/40 text-primary"
  if (value > 20) return "bg-[hsl(var(--sentinel-elevated))]/40 text-[hsl(var(--sentinel-elevated))]"
  return "bg-white/5 text-muted-foreground"
}

function getCellLabel(value: number): string {
  if (value > 70) return "Expert"
  if (value > 45) return "Prof"
  if (value > 20) return "Dev"
  return "Gap"
}

// ─── Talent Content ───────────────────────────────────────────────────────────

function TalentContent() {
  const router = useRouter()
  const [selectedUserHash, setSelectedUserHash] = useState<string | null>(null)

  const { users, isLoading: usersLoading } = useUsers()

  useEffect(() => {
    if (!selectedUserHash && users.length > 0) {
      setSelectedUserHash(users[0].user_hash)
    }
  }, [users, selectedUserHash])

  const employees = useMemo(() => mapUsersToEmployees(users), [users])

  const { data: networkData, isLoading } = useGlobalNetworkData()
  const { data: teamData } = useTeamData()

  const talentProfiles = useMemo((): TalentProfile[] => {
    const clamp = (v: number) => Math.max(0, Math.min(100, v))

    if (!networkData?.nodes || networkData.nodes.length === 0) {
      return employees.map((emp) => ({
        user_hash: emp.user_hash,
        name: emp.name,
        role: emp.role,
        skills: { technical: 0, communication: 0, leadership: 0, collaboration: 0, adaptability: 0, creativity: 0 },
        betweenness: 0, eigenvector: 0, unblocking: 0,
        is_hidden_gem: false, potential_score: 0, visibility_score: 0,
      }))
    }

    const maxUnblocking = Math.max(1, ...networkData.nodes.map((n: NetworkNode) => n.unblocking_count ?? 0))

    return networkData.nodes.map((node: NetworkNode, idx: number) => {
      const betweenness = node.betweenness ?? 0
      const eigenvector = node.eigenvector ?? 0
      const unblocking = node.unblocking_count ?? 0
      const technical = clamp(betweenness * 100)
      const leadership = clamp(eigenvector * 100)
      const collaboration = clamp((unblocking / maxUnblocking) * 100)
      const potential_score = clamp((betweenness * 0.6 + eigenvector * 0.4) * 100)
      const visibility_score = clamp(betweenness * 100)

      return {
        user_hash: node.id || `user_${idx}`,
        name: node.label || `User ${idx + 1}`,
        role: employees[idx % Math.max(employees.length, 1)]?.role || "Engineer",
        skills: { technical, communication: 0, leadership, collaboration, adaptability: 0, creativity: 0 },
        betweenness, eigenvector, unblocking,
        is_hidden_gem: node.is_hidden_gem ?? false,
        potential_score, visibility_score,
      }
    })
  }, [networkData, employees])

  const selectedProfile = useMemo(() =>
    talentProfiles.find(p => p.user_hash === selectedUserHash) || talentProfiles[0] || null,
    [talentProfiles, selectedUserHash]
  )

  const hiddenGems = useMemo(() =>
    talentProfiles.filter(p => p.is_hidden_gem).sort((a, b) => b.potential_score - a.potential_score).slice(0, 6),
    [talentProfiles]
  )

  const topPerformers = useMemo(() =>
    [...talentProfiles].sort((a, b) => {
      const sA = a.betweenness * 0.4 + a.eigenvector * 0.3 + a.unblocking * 0.3
      const sB = b.betweenness * 0.4 + b.eigenvector * 0.3 + b.unblocking * 0.3
      return sB - sA
    }).slice(0, 8),
    [talentProfiles]
  )

  // Flight risk: employees with elevated risk level
  const flightRisks = useMemo(() =>
    employees
      .filter(e => e.risk_level === "ELEVATED" || e.risk_level === "CRITICAL")
      .map(e => ({
        ...e,
        risk_pct: e.risk_level === "CRITICAL" ? 82 : 54,
      }))
      .slice(0, 5),
    [employees]
  )

  const skillsDistribution = useMemo(() => {
    const skills = ["technical", "communication", "leadership", "collaboration", "adaptability", "creativity"]
    return skills.map(skill => {
      const values = talentProfiles.map(p => p.skills[skill as keyof typeof p.skills])
      const avg = values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1)
      const max = Math.max(...values, 0)
      const min = Math.min(...values, 0)
      return { skill: skill.charAt(0).toUpperCase() + skill.slice(1), average: Math.round(avg), max: Math.round(max), min: Math.round(min) }
    })
  }, [talentProfiles])

  const avgPerfScore = skillsDistribution.length > 0
    ? Math.round(skillsDistribution.reduce((a, b) => a + (b.average || 0), 0) / skillsDistribution.length)
    : 0

  if (usersLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-col gap-5 p-4 lg:p-6">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--sentinel-gem))]/15 border border-[hsl(var(--sentinel-gem))]/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-[hsl(var(--sentinel-gem))]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Manrope',sans-serif] text-foreground">Talent Engine</h1>
              <p className="text-sm text-muted-foreground">Hidden talent &amp; skill discovery</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground bg-white/5 border border-white/5 rounded-full px-3 py-1">
              Last analyzed 3 hours ago
            </span>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Run Analysis
            </Button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-white/10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "High Performers",
              value: topPerformers.length,
              sub: "Highest network impact",
              color: "text-accent",
              icon: Award,
              badge: null,
            },
            {
              label: "Hidden Gems",
              value: hiddenGems.length,
              sub: "Undiscovered talent",
              color: "text-[hsl(var(--sentinel-gem))]",
              icon: Gem,
              badge: hiddenGems.length > 0 ? "New" : null,
            },
            {
              label: "Flight Risks",
              value: flightRisks.length,
              sub: "Elevated/critical risk",
              color: "text-destructive",
              icon: AlertTriangle,
              badge: null,
            },
            {
              label: "Avg Performance",
              value: avgPerfScore,
              sub: "Team skill average",
              color: "text-primary",
              icon: BarChart3,
              badge: null,
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                {stat.badge && (
                  <span className="ml-auto text-[9px] bg-accent/15 text-accent border border-accent/20 rounded-full px-1.5 py-0.5">
                    {stat.badge}
                  </span>
                )}
              </div>
              <p className={cn("text-3xl font-bold font-mono", stat.color)}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main Grid 2 cols ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ─ Left col ─────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Talent Quadrant */}
            <div className="bg-card border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Talent Quadrant
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--sentinel-gem))]" />Gem</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" />Star</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Potential</span>
                </div>
              </div>
              {talentProfiles.length > 0 ? (
                <TalentQuadrant profiles={talentProfiles} />
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Target className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No talent data available yet</p>
                </div>
              )}
            </div>

            {/* Hidden Gems */}
            <div className="bg-card border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Gem className="h-4 w-4 text-[hsl(var(--sentinel-gem))]" />
                Hidden Gems
                {hiddenGems.length > 0 && (
                  <Badge className="text-[9px] bg-[hsl(var(--sentinel-gem))]/15 text-[hsl(var(--sentinel-gem))] border-[hsl(var(--sentinel-gem))]/20 ml-1">
                    {hiddenGems.length} found
                  </Badge>
                )}
              </h3>
              {hiddenGems.length > 0 ? (
                <div className="space-y-2">
                  {hiddenGems.map((gem) => (
                    <div key={gem.user_hash} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--sentinel-gem))]/5 border border-[hsl(var(--sentinel-gem))]/10">
                      <div className="h-8 w-8 rounded-full bg-[hsl(var(--sentinel-gem))]/15 flex items-center justify-center shrink-0">
                        <Gem className="h-4 w-4 text-[hsl(var(--sentinel-gem))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{gem.name}</p>
                        <p className="text-[10px] text-muted-foreground">{gem.role} · Potential: {gem.potential_score.toFixed(0)}%</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] px-2 border-white/10 hover:border-accent/30 transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]"
                        onClick={() => router.push(`/search?q=${gem.user_hash}`)}
                      >
                        Recognize &amp; Retain
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 gap-2 border border-dashed border-border rounded-lg">
                  <Sparkles className="h-6 w-6 text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground">No hidden gems detected yet</p>
                </div>
              )}
            </div>
          </div>

          {/* ─ Right col ────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Skill Coverage Heatmap */}
            <div className="bg-card border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[hsl(var(--sentinel-info))]" />
                Skill Coverage Heatmap
              </h3>
              <div className="overflow-x-auto">
                {/* Column headers */}
                <div className="flex items-center gap-0.5 mb-1">
                  <div className="w-24 shrink-0" />
                  {SKILLS_COLS.map((s) => (
                    <div key={s} className="flex-1 text-[9px] text-muted-foreground text-center font-medium px-0.5">{s}</div>
                  ))}
                </div>
                {/* Rows */}
                {talentProfiles.slice(0, 8).map((profile) => {
                  const skillValues = [
                    profile.skills.technical,
                    profile.skills.leadership,
                    profile.skills.collaboration,
                    profile.skills.communication,
                    profile.skills.creativity,
                  ]
                  return (
                    <div key={profile.user_hash} className="flex items-center gap-0.5 mb-0.5">
                      <div className="w-24 shrink-0 text-[10px] text-muted-foreground truncate pr-2">{profile.name}</div>
                      {skillValues.map((v, si) => (
                        <div
                          key={si}
                          className={cn("flex-1 rounded-sm py-1 text-center text-[9px] font-medium transition-colors", getCellClass(v))}
                          title={`${SKILLS_COLS[si]}: ${v.toFixed(0)}%`}
                        >
                          {getCellLabel(v)}
                        </div>
                      ))}
                    </div>
                  )
                })}
                {talentProfiles.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-24 gap-2">
                    <p className="text-xs text-muted-foreground">No skill data available</p>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-accent/60" />Expert (&gt;70)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/40" />Prof</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[hsl(var(--sentinel-elevated))]/40" />Dev</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-white/5" />Gap</span>
                </div>
              </div>
            </div>

            {/* Retention Risk */}
            <div className="bg-card border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" />
                Retention Risk
              </h3>
              {flightRisks.length > 0 ? (
                <div className="space-y-3">
                  {flightRisks.map((emp) => (
                    <div key={emp.user_hash} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-destructive/15 text-destructive text-[10px]">
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground truncate">{emp.name}</span>
                          <span className="text-[10px] font-mono text-destructive ml-2 shrink-0">{emp.risk_pct}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-destructive rounded-full transition-all duration-500" style={{ width: `${emp.risk_pct}%` }} />
                        </div>
                      </div>
                      <button
                        className="shrink-0 text-[10px] border border-white/10 rounded px-2 py-1 text-muted-foreground hover:text-foreground hover:border-white/20 transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]"
                        onClick={() => router.push(`/search?q=${emp.user_hash}`)}
                      >
                        Schedule Talk
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 gap-2 border border-dashed border-border rounded-lg">
                  <Shield className="h-6 w-6 text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground">No significant flight risks detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Top Performers ───────────────────────────────────────────────── */}
        <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-[hsl(var(--sentinel-gem))]" />
              Top Performers
            </h3>
            <Badge variant="secondary" className="text-[10px]">Highest Network Impact</Badge>
          </div>
          <div className="divide-y divide-white/5">
            {topPerformers.map((performer, idx) => (
              <div
                key={performer.user_hash}
                className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-white font-bold text-xs font-mono shrink-0",
                  idx === 0 ? "bg-[hsl(var(--sentinel-gem))]" : idx === 1 ? "bg-muted-foreground/50" : idx === 2 ? "bg-[hsl(var(--sentinel-elevated))]/70" : "bg-muted"
                )}>
                  {idx + 1}
                </div>
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className={cn(
                    "text-xs",
                    performer.is_hidden_gem ? "bg-[hsl(var(--sentinel-gem))]/15 text-[hsl(var(--sentinel-gem))]" : "bg-muted"
                  )}>
                    {getInitials(performer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{performer.name}</p>
                    {performer.is_hidden_gem && <Gem className="h-3 w-3 text-[hsl(var(--sentinel-gem))] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{performer.role}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium font-mono text-xs text-foreground">{(performer.betweenness * 100).toFixed(0)}%</p>
                    <p className="text-[10px] text-muted-foreground">Betweenness</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium font-mono text-xs text-foreground">{(performer.eigenvector * 100).toFixed(0)}%</p>
                    <p className="text-[10px] text-muted-foreground">Eigenvector</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium font-mono text-xs text-foreground">{performer.unblocking}</p>
                    <p className="text-[10px] text-muted-foreground">Unblocked</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]"
                  onClick={() => router.push(`/search?q=${performer.user_hash}`)}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {topPerformers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Award className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No performer data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><Info className="h-3 w-3" />Refreshed every 5 minutes</span>
          <span className="h-3 border-l border-border" />
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </main>
    </ScrollArea>
  )
}

export default function TalentEnginePage() {
  return <TalentContent />
}
