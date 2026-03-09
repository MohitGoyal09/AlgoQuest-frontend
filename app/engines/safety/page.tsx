"use client"

import { Suspense, useState, useMemo, useEffect } from "react"

import { RiskAssessment } from "@/components/risk-assessment"
import { StatCards } from "@/components/stat-cards"
import { NudgeCard } from "@/components/nudge-card"
import { VelocityChart } from "@/components/velocity-chart"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Shield,
  Users,
  Heart,
  AlertTriangle,
  TrendingUp,
  Activity,
  Bell,
  BellOff,
  ChevronRight,
  RefreshCw,
  Zap,
  Clock,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Info,
  MessageSquare
} from "lucide-react"

import { Employee, RiskLevel, toRiskLevel } from "@/types"

import { useRiskData } from "@/hooks/useRiskData"
import { useTeamData } from "@/hooks/useTeamData"
import { useRiskHistory } from "@/hooks/useRiskHistory"
import { useUsers } from "@/hooks/useUsers"
import { useNudge } from "@/hooks/useNudge"

function SafetyContent() {
  const [selectedUserHash, setSelectedUserHash] = useState<string | null>(null)
  const [showAlertsOnly, setShowAlertsOnly] = useState(false)

  const { users, isLoading: usersLoading } = useUsers()

  useEffect(() => {
    if (!selectedUserHash && users.length > 0) {
      setSelectedUserHash(users[0].user_hash)
    }
  }, [users, selectedUserHash])

  const employees = useMemo(() => {
    return users.map(u => ({
      user_hash: u.user_hash,
      name: u.name || `User ${u.user_hash.slice(0, 4)}`,
      role: u.role || "Engineer",
      risk_level: toRiskLevel(u.risk_level),
      velocity: u.velocity || 0,
      confidence: u.confidence || 0,
      belongingness_score: u.belongingness_score || 0.5,
      circadian_entropy: u.circadian_entropy || 0.5,
      updated_at: u.updated_at || new Date().toISOString(),
      persona: "Engineer",
      indicators: {
        overwork: u.overwork || false,
        isolation: u.isolation || false,
        fragmentation: u.fragmentation || false,
        late_night_pattern: u.late_night_pattern || false,
        weekend_work: u.weekend_work || false,
        communication_decline: u.communication_decline || false
      }
    } as Employee))
  }, [users])

  const selectedBaseEmployee = useMemo(() =>
    employees.find(e => e.user_hash === selectedUserHash) || employees[0] || null
  , [employees, selectedUserHash])

  const { data: riskData } = useRiskData(selectedUserHash)
  const { data: nudgeData } = useNudge(selectedUserHash)
  const { data: teamData } = useTeamData()
  const { history: riskHistory } = useRiskHistory(selectedUserHash)

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
        overwork: riskData.indicators?.overwork || false,
        isolation: riskData.indicators?.isolation || false,
        fragmentation: riskData.indicators?.fragmentation || false,
        late_night_pattern: riskData.indicators?.late_night_pattern || false,
        weekend_work: riskData.indicators?.weekend_work || false,
        communication_decline: riskData.indicators?.communication_decline || false,
      }
    } as Employee
  }, [selectedBaseEmployee, riskData])

  const mappedTeamMetrics = useMemo(() => {
    if (!teamData) {
      const total = employees.length
      const healthy = employees.filter(e => e.risk_level === "LOW").length
      const elevated = employees.filter(e => e.risk_level === "ELEVATED").length
      const critical = employees.filter(e => e.risk_level === "CRITICAL").length
      const avgVel = employees.reduce((sum, e) => sum + e.velocity, 0) / (total || 1)
      
      return {
        total_members: total,
        healthy_count: healthy,
        elevated_count: elevated,
        critical_count: critical,
        avg_velocity: avgVel,
        contagion_risk: critical > 2 ? "CRITICAL" : elevated > 4 ? "ELEVATED" : "LOW",
        graph_fragmentation: 0.3,
        comm_decay_rate: 0.15,
      }
    }

    const total = employees.length
    const healthy = employees.filter(e => e.risk_level === "LOW").length
    const elevated = employees.filter(e => e.risk_level === "ELEVATED").length
    const critical = employees.filter(e => e.risk_level === "CRITICAL").length

    return {
      total_members: total,
      healthy_count: healthy,
      elevated_count: elevated,
      critical_count: critical,
      avg_velocity: teamData.metrics?.avg_velocity || employees.reduce((sum, e) => sum + e.velocity, 0) / (total || 1),
      contagion_risk: teamData.contagion_risk || (critical > 2 ? "CRITICAL" : elevated > 4 ? "ELEVATED" : "LOW"),
      graph_fragmentation: teamData.graph_fragmentation || 0.3,
      comm_decay_rate: teamData.metrics?.comm_decay_rate || 0.15,
    }
  }, [teamData, employees])

  const teamRiskScore = useMemo(() => {
    if (mappedTeamMetrics.total_members === 0) return 0
    const weightedScore = (
      (mappedTeamMetrics.critical_count * 100) +
      (mappedTeamMetrics.elevated_count * 50) +
      (mappedTeamMetrics.healthy_count * 10)
    ) / mappedTeamMetrics.total_members
    return Math.min(Math.round(weightedScore), 100)
  }, [mappedTeamMetrics])

  const riskDistribution = useMemo(() => {
    const total = employees.length || 1
    return {
      critical: mappedTeamMetrics.critical_count,
      criticalPct: Math.round((mappedTeamMetrics.critical_count / total) * 100),
      elevated: mappedTeamMetrics.elevated_count,
      elevatedPct: Math.round((mappedTeamMetrics.elevated_count / total) * 100),
      healthy: mappedTeamMetrics.healthy_count,
      healthyPct: Math.round((mappedTeamMetrics.healthy_count / total) * 100),
    }
  }, [employees, mappedTeamMetrics])

  const highRiskEmployees = useMemo(() => {
    return employees
      .filter(e => e.risk_level === "CRITICAL" || e.risk_level === "ELEVATED")
      .sort((a, b) => {
        const order = { CRITICAL: 0, ELEVATED: 1, LOW: 2 }
        return order[a.risk_level] - order[b.risk_level]
      })
  }, [employees])

  const filteredEmployees = showAlertsOnly 
    ? highRiskEmployees 
    : employees

  const mockHistory = useMemo(() => {
    const days = 30
    const history = []
    let velocity = 1.2 + Math.random() * 0.5
    let belongingness = 0.6 + Math.random() * 0.2
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      velocity += (Math.random() - 0.5) * 0.3
      velocity = Math.max(0.5, Math.min(3, velocity))
      
      belongingness += (Math.random() - 0.5) * 0.1
      belongingness = Math.max(0.2, Math.min(0.9, belongingness))
      
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        velocity: parseFloat(velocity.toFixed(2)),
        belongingness_score: parseFloat(belongingness.toFixed(2))
      })
    }
    return history
  }, [])

  const chartData = riskHistory && riskHistory.length > 0 ? riskHistory : mockHistory

  const handleUserSelect = (emp: Employee) => {
    setSelectedUserHash(emp.user_hash)
  }

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "CRITICAL":
        return "text-[hsl(var(--sentinel-critical))]"
      case "ELEVATED":
        return "text-[hsl(var(--sentinel-elevated))]"
      case "LOW":
        return "text-[hsl(var(--sentinel-healthy))]"
      default:
        return "text-muted-foreground"
    }
  }

  const getRiskBg = (level: RiskLevel) => {
    switch (level) {
      case "CRITICAL":
        return "bg-[hsl(var(--sentinel-critical))]/8 border-[hsl(var(--sentinel-critical))]/20"
      case "ELEVATED":
        return "bg-[hsl(var(--sentinel-elevated))]/8 border-[hsl(var(--sentinel-elevated))]/20"
      case "LOW":
        return "bg-[hsl(var(--sentinel-healthy))]/8 border-[hsl(var(--sentinel-healthy))]/20"
      default:
        return "bg-muted/50"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1">
        <main className="flex flex-col gap-6 p-5 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/30">
                <Shield className="h-7 w-7 text-red-500" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Safety Valve</h2>
                <p className="text-sm text-muted-foreground">Burnout detection & risk analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Hero Section - Team Risk Score */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/50">
            <div className="absolute inset-0 bg-red-500/5" />
            
            <div className="relative grid gap-8 p-8 md:grid-cols-2 lg:gap-12">
              {/* Score Display */}
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 blur-3xl" />
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-slate-700 bg-slate-900/80 shadow-2xl">
                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-bold tracking-tight text-white font-mono">
                        {teamRiskScore}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                        Risk Score
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {teamRiskScore >= 60 ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-red-400">High team risk - Immediate action needed</span>
                    </>
                  ) : teamRiskScore >= 30 ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="text-sm font-medium text-orange-400">Elevated risk - Monitor closely</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-400">Team health is good</span>
                    </>
                  )}
                </div>
              </div>

              {/* Risk Distribution */}
              <div className="flex flex-col justify-center gap-6">
                <div className="flex flex-col gap-4">
                  {/* Critical */}
                  <div className="group relative overflow-hidden rounded-xl bg-red-950/30 p-4 border border-red-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-red-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-400">Critical</p>
                          <p className="text-xs text-red-500/60">Immediate attention required</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-400">{riskDistribution.critical}</p>
                        <p className="text-xs text-red-500/60">{riskDistribution.criticalPct}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Elevated */}
                  <div className="group relative overflow-hidden rounded-xl bg-orange-950/30 p-4 border border-orange-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-orange-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                          <TrendingUp className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-orange-400">Elevated</p>
                          <p className="text-xs text-orange-500/60">Monitoring closely</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-400">{riskDistribution.elevated}</p>
                        <p className="text-xs text-orange-500/60">{riskDistribution.elevatedPct}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Healthy */}
                  <div className="group relative overflow-hidden rounded-xl bg-green-950/30 p-4 border border-green-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-green-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                          <Heart className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-400">Healthy</p>
                          <p className="text-xs text-green-500/60">Within normal range</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">{riskDistribution.healthy}</p>
                        <p className="text-xs text-green-500/60">{riskDistribution.healthyPct}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Burnout Prediction Section - PROMINENT */}
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Burnout Prediction</h3>
                <p className="text-xs text-muted-foreground">AI-powered risk forecasting based on behavioral patterns</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {/* High Risk Predictions */}
              <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-400">High Risk (Next 2 Weeks)</span>
                  <Badge variant="destructive" className="text-[10px]">
                    {employees.filter(e => e.risk_level === "CRITICAL").length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Employees showing signs of potential burnout
                </p>
                <div className="space-y-2">
                  {employees.filter(e => e.risk_level === "CRITICAL").slice(0, 3).map(emp => (
                    <div key={emp.user_hash} className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-foreground">{emp.name}</span>
                    </div>
                  ))}
                  {employees.filter(e => e.risk_level === "CRITICAL").length === 0 && (
                    <p className="text-xs text-muted-foreground">No high-risk predictions</p>
                  )}
                </div>
              </div>

              {/* At Risk */}
              <div className="rounded-xl bg-orange-500/10 p-4 border border-orange-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-400">At Risk (Next 4 Weeks)</span>
                  <Badge className="text-[10px] bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {employees.filter(e => e.risk_level === "ELEVATED").length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Employees who may become at-risk without intervention
                </p>
                <div className="space-y-2">
                  {employees.filter(e => e.risk_level === "ELEVATED").slice(0, 3).map(emp => (
                    <div key={emp.user_hash} className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <span className="text-foreground">{emp.name}</span>
                    </div>
                  ))}
                  {employees.filter(e => e.risk_level === "ELEVATED").length === 0 && (
                    <p className="text-xs text-muted-foreground">No at-risk predictions</p>
                  )}
                </div>
              </div>

              {/* Prevention Tips */}
              <div className="rounded-xl bg-green-500/10 p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-400">Prevention Actions</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Recommended interventions based on current patterns
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <Zap className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Schedule mandatory breaks for high-velocity employees</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Initiate 1:1 check-ins with at-risk team members</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Heart className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Review workload distribution across the team</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          {mappedTeamMetrics && <StatCards metrics={mappedTeamMetrics as any} />}

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Employee Cards */}
            <div className="lg:col-span-2 space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-400" />
                  <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
                  <Badge variant="secondary" className="ml-2">
                    {filteredEmployees.length}
                  </Badge>
                </div>
                <Button
                  variant={showAlertsOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAlertsOnly(!showAlertsOnly)}
                  className={showAlertsOnly ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  {showAlertsOnly ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                  {showAlertsOnly ? "Showing Alerts" : "Show Alerts Only"}
                </Button>
              </div>

              {/* Employee Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.user_hash}
                    onClick={() => handleUserSelect(emp)}
                    className={`relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:scale-[1.02] ${
                      selectedUserHash === emp.user_hash
                        ? `${getRiskBg(emp.risk_level)} border-current`
                        : 'border-border bg-card hover:bg-accent'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={emp.name} />
                      <AvatarFallback className={`text-xs ${getRiskBg(emp.risk_level)}`}>
                        {getInitials(emp.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground truncate">{emp.name}</p>
                        <Badge
                          variant="outline"
                          className={`ml-2 text-[10px] ${getRiskBg(emp.risk_level)}`}
                        >
                          {emp.risk_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{emp.role}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className={`text-xs font-mono font-medium ${getRiskColor(emp.risk_level)}`}>
                          {emp.velocity.toFixed(1)} vel
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Selected Employee Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-foreground">Selected Employee</h3>
              </div>

              {currentEmployee ? (
                <div className="space-y-4">
                  <RiskAssessment employee={currentEmployee} />
                  <NudgeCard nudge={nudgeData ?? undefined} />
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground">Select an employee to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* High Risk Alerts Section */}
          {highRiskEmployees.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-foreground">High Risk Alerts</h3>
                <Badge variant="destructive" className="ml-2">
                  {highRiskEmployees.length}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {highRiskEmployees.slice(0, 6).map((emp) => (
                  <Card
                    key={emp.user_hash}
                    className={`cursor-pointer transition-all hover:scale-[1.02] ${
                      emp.risk_level === "CRITICAL"
                        ? "border-red-500/50 bg-red-950/20"
                        : "border-orange-500/50 bg-orange-950/20"
                    }`}
                    onClick={() => handleUserSelect(emp)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={
                          emp.risk_level === "CRITICAL" 
                            ? "bg-red-500/20 text-red-400" 
                            : "bg-orange-500/20 text-orange-400"
                        }>
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{emp.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{emp.role}</p>
                      </div>
                      <Badge
                        variant={emp.risk_level === "CRITICAL" ? "destructive" : "secondary"}
                        className={emp.risk_level === "ELEVATED" ? "bg-orange-500" : ""}
                      >
                        {emp.risk_level}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Velocity Trends Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-foreground">Velocity Trends</h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">Velocity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Belongingness</span>
                </div>
              </div>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <VelocityChart history={chartData} title="" />
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-center gap-6 py-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Data refreshed every 5 minutes</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  )
}

export default function SafetyValvePage() {
  return (
    <ProtectedRoute>
      <SafetyContent />
    </ProtectedRoute>
  )
}
