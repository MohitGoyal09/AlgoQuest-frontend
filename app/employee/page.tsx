"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  Shield,
  Clock,
  Calendar,
  Coffee,
  UserCircle,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  Award,
  Zap,
  PauseCircle,
  PlayCircle,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { SkillsRadar } from "@/components/skills-radar"
import { AskSentinel } from "@/components/ai/AskSentinel"
import { api } from "@/lib/api"
import { getRiskHistory, getNetworkAnalysis } from "@/lib/api"
import { toRiskLevel, type RiskLevel, type TalentScoutData } from "@/types"
import { cn } from "@/lib/utils"

// Types
interface UserProfile {
  user_hash: string
  name?: string
  role: string
  consent_share_with_manager: boolean
  consent_share_anonymized: boolean
  monitoring_paused_until: string | null
  created_at: string
}

interface RiskData {
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
  risk: RiskData | null
  audit_trail: AuditEntry[]
  monitoring_status: MonitoringStatus
}

interface RiskHistoryPoint {
  timestamp: string
  risk_level: RiskLevel
  velocity: number
  confidence: number
  belongingness_score: number
}

// Risk level configuration
const riskConfig: Record<RiskLevel, { 
  label: string
  color: string
  bgClass: string
  borderClass: string
  icon: React.ReactNode
  description: string
}> = {
  CRITICAL: {
    label: "High Attention",
    color: "text-red-500",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/20",
    icon: <AlertCircle className="h-4 w-4" />,
    description: "Your wellbeing signals suggest taking a break",
  },
  ELEVATED: {
    label: "Elevated",
    color: "text-amber-500",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
    icon: <Activity className="h-4 w-4" />,
    description: "Some signals detected—consider a wellness check",
  },
  LOW: {
    label: "Balanced",
    color: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: "Your work patterns look healthy",
  },
}

// Mock talking points for 1:1 prep
const MOCK_TALKING_POINTS = [
  "Celebrate recent project completion",
  "Discuss workload distribution and priorities",
  "Career development and growth goals",
  "Team collaboration feedback",
]

function EmployeeDashboardContent() {
  const router = useRouter()
  const { signOut, userRole } = useAuth()
  
  // Data states
  const [data, setData] = useState<MeData | null>(null)
  const [riskHistory, setRiskHistory] = useState<RiskHistoryPoint[]>([])
  const [skillsData, setSkillsData] = useState<TalentScoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch employee data
      const meData = await api.get<MeData>('/me')
      setData(meData)

      if (meData?.user?.user_hash) {
        // Fetch risk history (using /me/risk-history or fallback to /engines/users/{hash}/history)
        try {
          const historyResponse = await api.get<any>(`/me/risk-history`)
          const historyData = Array.isArray(historyResponse) 
            ? historyResponse 
            : (historyResponse?.history || [])
          setRiskHistory(historyData.map((p: any) => ({
            ...p,
            risk_level: toRiskLevel(p.risk_level),
          })))
        } catch (err) {
          // Fallback to engines endpoint
          const fallbackHistory = await getRiskHistory(meData.user.user_hash, 14)
          setRiskHistory(fallbackHistory.map((p: any) => ({
            ...p,
            risk_level: toRiskLevel(p.risk_level),
          })))
        }

        // Fetch skills/talent data
        try {
          const talentData = await getNetworkAnalysis(meData.user.user_hash)
          setSkillsData(talentData)
        } catch (err) {
          console.warn("Could not fetch talent data:", err)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load your dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Consent updates
  const updateConsent = async (type: "manager" | "anonymized", value: boolean) => {
    if (!data) return
    try {
      setUpdating(true)
      const payload = type === "manager"
        ? { consent_share_with_manager: value }
        : { consent_share_anonymized: value }
      await api.put("/me/consent", payload)
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update consent")
    } finally {
      setUpdating(false)
    }
  }

  // Monitoring controls
  const pauseMonitoring = async (hours: number) => {
    if (!data) return
    try {
      setUpdating(true)
      await api.post(`/me/pause-monitoring?hours=${hours}`, {})
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to pause monitoring")
    } finally {
      setUpdating(false)
    }
  }

  const resumeMonitoring = async () => {
    if (!data) return
    try {
      setUpdating(true)
      await api.post("/me/resume-monitoring", {})
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to resume monitoring")
    } finally {
      setUpdating(false)
    }
  }

  // Schedule break action
  const scheduleBreak = async () => {
    if (!data?.user?.user_hash) return
    try {
      await api.post(`/engines/users/${data.user.user_hash}/nudge/schedule-break`, {})
      // Show success toast or feedback
    } catch (err) {
      console.error("Failed to schedule break:", err)
    }
  }

  // Calculate weekly patterns from history
  const weeklyPattern = (() => {
    if (riskHistory.length < 3) return null
    const recent = riskHistory.slice(-7)
    const avgVelocity = recent.reduce((sum, p) => sum + (p.velocity || 0), 0) / recent.length
    const riskChanges = recent.filter((p, i) => i > 0 && p.risk_level !== recent[i-1].risk_level).length
    return {
      avgVelocity,
      riskChanges,
      dataPoints: recent.length,
    }
  })()

  // Get user's skills from talent data
  const userSkills = (() => {
    if (!skillsData?.nodes || !data?.user?.user_hash) return null
    const userNode = skillsData.nodes.find((n: { id: string }) => n.id === data.user?.user_hash)
    if (!userNode) return null
    return {
      betweenness: userNode.betweenness || 0,
      eigenvector: userNode.eigenvector || 0,
      unblocking: userNode.unblocking_count || 0,
      isHiddenGem: userNode.is_hidden_gem || false,
    }
  })()

  // Skills radar data (mock skills based on network centrality)
  const skillsRadarData = userSkills ? {
    technical: Math.min(100, Math.round((userSkills.betweenness || 0.5) * 100)),
    communication: Math.min(100, Math.round((userSkills.eigenvector || 0.5) * 100)),
    leadership: Math.min(100, Math.round((userSkills.unblocking || 0.3) * 100 * 2)),
    collaboration: Math.min(100, Math.round((userSkills.betweenness || 0.5) * 80)),
    adaptability: Math.min(100, 70 + Math.round(Math.random() * 20)),
    creativity: Math.min(100, 60 + Math.round(Math.random() * 25)),
  } : null

  const currentRisk = data?.risk?.risk_level 
    ? riskConfig[toRiskLevel(data.risk.risk_level)]
    : riskConfig.LOW

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h3 className="text-lg font-semibold mb-1">Unable to load dashboard</h3>
          <p className="text-sm text-muted-foreground mb-4">{error || "Something went wrong"}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    )
  }

  const memberSince = data.user.created_at
    ? new Date(data.user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
              <UserCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">My Dashboard</h1>
              <p className="text-[10px] text-muted-foreground">
                {data.user.name || `User ${data.user.user_hash.slice(0, 8)}`} · Member since {memberSince}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {data.user.role}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => router.push("/me")}>
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <Clock className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-xs text-muted-foreground hover:text-foreground">
              Dismiss
            </button>
          </div>
        )}

        {/* Ask Sentinel Widget */}
        <section className="mb-6">
          <AskSentinel />
        </section>

        {/* Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* Left Column - Wellbeing & Progress */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* My Wellbeing Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-semibold">My Wellbeing</h2>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {/* Personal Risk Score Card */}
                <Card className={cn("border-2", currentRisk.borderClass)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", currentRisk.bgClass)}>
                          <span className={currentRisk.color}>{currentRisk.icon}</span>
                        </div>
                        <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px]", currentRisk.bgClass, currentRisk.color)}>
                        {currentRisk.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-2">
                      <span className={cn("text-3xl font-bold", currentRisk.color)}>
                        {currentRisk.label}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentRisk.description}
                      </p>
                    </div>
                    
                    {data.risk && (
                      <div className="space-y-2 pt-2 border-t">
                        <MetricRow 
                          label="Work Velocity" 
                          value={data.risk.velocity?.toFixed(2) || "N/A"}
                          tooltip="Rate of work activity"
                        />
                        <MetricRow 
                          label="Confidence" 
                          value={`${(data.risk.confidence * 100).toFixed(0)}%`}
                          tooltip="Data confidence level"
                        />
                        <MetricRow 
                          label="Belongingness" 
                          value={data.risk.thwarted_belongingness?.toFixed(2) || "N/A"}
                          tooltip="Social connection indicator"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Weekly Patterns Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                      </div>
                      <CardTitle className="text-sm font-medium">Weekly Patterns</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {weeklyPattern ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-foreground">
                              {weeklyPattern.avgVelocity.toFixed(1)}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Velocity</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <p className="text-2xl font-bold text-foreground">
                              {weeklyPattern.riskChanges}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Changes</p>
                          </div>
                        </div>
                        
                        {/* Mini Sparkline */}
                        <div className="h-16 flex items-end gap-1">
                          {riskHistory.slice(-14).map((point, i) => {
                            const height = Math.max(20, (point.velocity || 0.5) * 100)
                            const colorClass = point.risk_level === 'CRITICAL' ? 'bg-red-500' :
                              point.risk_level === 'ELEVATED' ? 'bg-amber-500' :
                              point.risk_level === 'LOW' ? 'bg-emerald-500' : 'bg-slate-400'
                            return (
                              <div
                                key={i}
                                className={cn("flex-1 rounded-t transition-all hover:opacity-80", colorClass)}
                                style={{ height: `${height}%` }}
                                title={`${new Date(point.timestamp).toLocaleDateString()}: ${point.risk_level}`}
                              />
                            )
                          })}
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                          Last 14 days activity pattern
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Not enough data yet</p>
                        <p className="text-xs text-muted-foreground/70">Check back in a few days</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Progress Report Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold">Progress Report</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Skills Radar */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                        <Award className="h-4 w-4 text-purple-500" />
                      </div>
                      <CardTitle className="text-sm font-medium">Skills Overview</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SkillsRadar 
                      data={skillsRadarData} 
                      height={220}
                    />
                    {userSkills?.isHiddenGem && (
                      <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-medium text-amber-600">Hidden Gem Detected</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Your network centrality suggests you're a key connector in the team
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Growth Trajectory */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
                        <TrendingUp className="h-4 w-4 text-teal-500" />
                      </div>
                      <CardTitle className="text-sm font-medium">Growth Trajectory</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Growth Metrics */}
                    <div className="space-y-3">
                      <GrowthMetric 
                        label="Network Centrality"
                        value={userSkills?.betweenness || 0}
                        max={1}
                        color="bg-purple-500"
                        description="Your influence in team communications"
                      />
                      <GrowthMetric 
                        label="Collaboration Score"
                        value={userSkills?.eigenvector || 0}
                        max={1}
                        color="bg-blue-500"
                        description="Quality of your connections"
                      />
                      <GrowthMetric 
                        label="Impact Factor"
                        value={Math.min(1, (userSkills?.unblocking || 0) * 2)}
                        max={1}
                        color="bg-emerald-500"
                        description="How often you unblock others"
                      />
                    </div>

                    <Separator />

                    {/* Achievements */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Recent Highlights
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-muted-foreground">Consistent activity this week</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="text-muted-foreground">Active in team discussions</span>
                        </div>
                        {userSkills?.isHiddenGem && (
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span className="text-muted-foreground">Key team connector</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Right Column - 1:1 & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upcoming 1:1 Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Upcoming 1:1</h2>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">Meeting Prep</CardTitle>
                        <CardDescription className="text-[10px]">Next Tuesday at 2:00 PM</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">In 3 days</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Talking Points */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Suggested Talking Points
                    </p>
                    <ul className="space-y-2">
                      {MOCK_TALKING_POINTS.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => router.push(`/ask-sentinel?query=Prepare for 1:1 with manager`)}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    AI-Generate Agenda
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Quick Actions Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold">Quick Actions</h2>
              </div>

              <div className="space-y-3">
                {/* Schedule Break */}
                <Card className="cursor-pointer hover:border-emerald-500/30 transition-colors" onClick={scheduleBreak}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Coffee className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Schedule a Break</p>
                      <p className="text-[10px] text-muted-foreground">Block time for wellness</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                {/* Request 1:1 */}
                <Card 
                  className="cursor-pointer hover:border-blue-500/30 transition-colors"
                  onClick={() => router.push('/dashboard?view=safety-valve')}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Request 1:1</p>
                      <p className="text-[10px] text-muted-foreground">Schedule with manager</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card 
                  className="cursor-pointer hover:border-purple-500/30 transition-colors"
                  onClick={() => router.push('/me')}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Shield className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Privacy Settings</p>
                      <p className="text-[10px] text-muted-foreground">Manage data sharing</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Privacy Controls - Prominently Displayed */}
            <Card className="border-2 border-purple-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                    <EyeOff className="h-4 w-4 text-purple-500" />
                  </div>
                  <CardTitle className="text-sm font-medium">Privacy Controls</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  You control who can see your wellbeing data. No one can access it without your permission.
                </p>

                {/* Share with Manager */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="share-manager" className="text-xs font-medium">
                      Share with Manager
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Allow detailed metrics access
                    </p>
                  </div>
                  <Switch
                    id="share-manager"
                    checked={data.user.consent_share_with_manager}
                    onCheckedChange={(checked) => updateConsent("manager", checked)}
                    disabled={updating}
                  />
                </div>

                <Separator />

                {/* Team Analytics */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="share-anon" className="text-xs font-medium">
                      Include in Team Analytics
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Anonymized team metrics
                    </p>
                  </div>
                  <Switch
                    id="share-anon"
                    checked={data.user.consent_share_anonymized}
                    onCheckedChange={(checked) => updateConsent("anonymized", checked)}
                    disabled={updating}
                  />
                </div>

                {/* Monitoring Status */}
                <div className="pt-2 border-t">
                  {data.monitoring_status.is_paused ? (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <PauseCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-medium text-amber-600">Monitoring Paused</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Resumes {data.monitoring_status.paused_until && 
                          new Date(data.monitoring_status.paused_until).toLocaleString()}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 w-full text-xs"
                        onClick={resumeMonitoring}
                        disabled={updating}
                      >
                        <PlayCircle className="h-3.5 w-3.5 mr-1" />
                        Resume Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Quick Pause
                      </p>
                      <div className="flex gap-2">
                        {[8, 24, 72].map((hours) => (
                          <button
                            key={hours}
                            onClick={() => pauseMonitoring(hours)}
                            disabled={updating}
                            className="flex-1 rounded-lg border bg-muted/30 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-40"
                          >
                            {hours}h
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2">
                  <EyeOff className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
                  <p className="text-[9px] text-muted-foreground leading-relaxed">
                    Your data is encrypted and private. We never share without consent.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper Components

function MetricRow({ 
  label, 
  value, 
  tooltip 
}: { 
  label: string
  value: string
  tooltip?: string
}) {
  return (
    <div className="flex items-center justify-between" title={tooltip}>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-xs font-mono font-medium">{value}</span>
    </div>
  )
}

function GrowthMetric({ 
  label, 
  value, 
  max, 
  color,
  description 
}: { 
  label: string
  value: number
  max: number
  color: string
  description: string
}) {
  const percentage = Math.min(100, Math.round((value / max) * 100))
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-[10px] text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[9px] text-muted-foreground">{description}</p>
    </div>
  )
}

export default function EmployeePage() {
  return (
    <ProtectedRoute>
      <EmployeeDashboardContent />
    </ProtectedRoute>
  )
}
