"use client"

import { Suspense, useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard-header"
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
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
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
  BarChart3
} from "lucide-react"

// Admin Components
import { GlobalStatsCards } from "@/components/dashboard/admin/global-stats"
import { OrgHealthMap } from "@/components/dashboard/admin/org-health-map"
import { AdminQuickActions } from "@/components/dashboard/admin/admin-actions"
import { AuditLogFeed } from "@/components/dashboard/admin/audit-log"

// Manager Components
// Manager Components
import { TeamStatsRow } from "@/components/dashboard/manager/team-stats-row"
import { TeamGrid } from "@/components/dashboard/manager/team-grid"
import { AnonymityToggle } from "@/components/dashboard/manager/anonymity-toggle"
import { IndividualInsights } from "@/components/dashboard/manager/individual-insights"

// Types
import { Employee, UserSummary, toRiskLevel, PersonaType } from "@/types"

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

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeView = searchParams.get("view") || "dashboard"
  const detailedUserHash = searchParams.get("uid")
  
  const { userRole, signOut } = useAuth()
  const [selectedUserHash, setSelectedUserHash] = useState<string | null>(null)
  
  // Manager view state
  const [isAnonymized, setIsAnonymized] = useState(true)
  
  // Mobile/desktop sidebar is now handled in layout, but mobile trigger might be needed
  // However, we rely on layout for sidebar rendering.
  // The header toggle button logic needs to be updated.
  
  // Employee profile data
  const [profileData, setProfileData] = useState<MeData | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [updatingConsent, setUpdatingConsent] = useState(false)

  // Fetch profile data for employee view
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

  // Determine view based on role
  const isEmployee = userRole?.role === 'employee'
  const isManager = userRole?.role === 'manager'
  const isAdmin = userRole?.role === 'admin'

  // Default view is dashboard for all roles
  useEffect(() => {
    if (!activeView || activeView === "profile") {
      if (isAdmin) {
        router.push('/dashboard?view=admin')
      } else if (isManager) {
        router.push('/dashboard?view=team')
      } else {
        router.push('/dashboard?view=dashboard')
      }
    }
  }, [userRole, isAdmin, isManager])

  // 1. Fetch Users
  const { users, isLoading: usersLoading } = useUsers()

  // Select first user by default when users load
  useEffect(() => {
    if (!selectedUserHash && users.length > 0) {
      setSelectedUserHash(users[0].user_hash)
    }
  }, [users, selectedUserHash])

  // Convert API Users to Employee objects for UI components
  const employees = useMemo(() => {
    return users.map(u => ({
      user_hash: u.user_hash,
      name: u.name || `User ${u.user_hash.slice(0, 4)}`,
      role: u.role || "Engineer",
      risk_level: toRiskLevel(u.risk_level),
      velocity: u.velocity || 0,
      confidence: u.confidence || 0,
      belongingness_score: 0.5,
      circadian_entropy: 0.5,
      updated_at: u.updated_at || new Date().toISOString(),
      persona: "Engineer",
      indicators: {
        overwork: false,
        isolation: false,
        fragmentation: false,
        late_night_pattern: false,
        weekend_work: false,
        communication_decline: false
      }
    } as Employee))
  }, [users])

  const selectedBaseEmployee = useMemo(() =>
    employees.find(e => e.user_hash === selectedUserHash) || employees[0] || null
    , [employees, selectedUserHash])

  // 2. Fetch specific data for selected user
  const { data: riskData, refetch: refetchRiskData } = useRiskData(selectedUserHash)
  const { history: fetchedHistory } = useRiskHistory(selectedUserHash)
  const { data: nudgeData } = useNudge(selectedUserHash)
  const { data: networkData, refetch: refetchNetworkData } = useNetworkData(selectedUserHash) // Fetch selected user's network centrality
  const { data: teamData, refetch: refetchTeamData } = useTeamData() // Fetch team Metrics
  const { data: forecastData, isLoading: forecastLoading } = useForecast() // SIR forecast

  const { injectEvent, createPersona } = useSimulation()
  const { events: recentEvents, refetch: refetchEvents } = useRecentEvents()

  // 3. Construct currentEmployee with live risk data
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


  // 4. Construct other props
  const history = useMemo(() => {
    if (fetchedHistory && fetchedHistory.length > 0) {
      return fetchedHistory.map((p: any) => ({
        ...p,
        date: new Date(p.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        risk_level: toRiskLevel(p.risk_level)
      }))
    }
    return [] // No history, return empty array (do NOT use mock fallback)
  }, [fetchedHistory])

  // Map Activity Events
  const mappedEvents = useMemo(() => {
    return recentEvents.map((e, index) => ({
      id: `evt-${index}-${e.timestamp}`,
      timestamp: e.timestamp,
      event_type: e.event_type,
      description: e.description || `Event: ${e.event_type}`,
      risk_impact: e.risk_impact || "neutral"
    }))
  }, [recentEvents])

  // Map Team Metrics - Dynamic calculation from actual data
  const mappedTeamMetrics = useMemo(() => {
    // Calculate counts from actual employees data
    const total_members = employees.length
    const healthy_count = employees.filter(e => e.risk_level === "LOW" || !e.risk_level).length
    const elevated_count = employees.filter(e => e.risk_level === "ELEVATED").length
    const critical_count = employees.filter(e => e.risk_level === "CRITICAL").length

    const avgVelocity = teamData?.metrics?.avg_velocity || employees.reduce((acc, e) => acc + (e.velocity || 0), 0) / (employees.length || 1)
    const graphFragmentation = teamData?.metrics?.graph_fragmentation || 0
    const commDecayRate = teamData?.metrics?.comm_decay_rate || 0
    const teamRisk = teamData?.team_risk || "LOW"

    // Calculate burnout risk as percentage (based on critical + elevated)
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

  // Handlers
  const handleUserSelect = (emp: Employee) => {
    setSelectedUserHash(emp.user_hash)
  }

  const handleSimulationInject = async (eventType: string) => {
    if (!currentEmployee) return
    try {
      await injectEvent(currentEmployee.user_hash, eventType)
      setTimeout(() => refetchEvents(), 1000) // Refresh feed
    } catch (e) {
      console.error("Simulation injection failed", e)
    }
  }

  const handleCreatePersona = async (personaId: string) => {
    const validPersonas: PersonaType[] = ['alex_burnout', 'sarah_gem', 'jordan_steady', 'maria_contagion'];
    if (!validPersonas.includes(personaId as PersonaType)) {
      console.error(`Invalid persona type: ${personaId}`);
      return;
    }
    try {
      const email = `${personaId.split('_')[0]}@simulation.com`
      await createPersona(email, personaId as PersonaType)
    } catch (e) {
      console.error("Failed to create persona", e)
    }
  }

  // Simple refresh handler - replaces WebSocket real-time updates
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

  // Auto-refresh every 60 seconds (simple polling instead of WebSocket)
  useEffect(() => {
    const interval = setInterval(handleRefresh, 60000)
    return () => clearInterval(interval)
  }, [handleRefresh])

  // Determine effective employee for detail viewing - must be called unconditionally
  const detailEmployee = useMemo(() => 
    employees.find(e => e.user_hash === detailedUserHash) || employees[0], 
    [employees, detailedUserHash]
  );

  if (!currentEmployee) {
     return <div className="flex h-full items-center justify-center">Loading Dashboard...</div>
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-[#0b101b]">
      <DashboardHeader 
        selectedUser={currentEmployee} 
        activeView={activeView} 
      />

      <ScrollArea className="flex-1">
        <main className="flex flex-col gap-6 p-5 lg:p-8 pb-20">
          
          {/* ==================== 1. DEFAULT DASHBOARD (Employee View) ==================== */}
          {activeView === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-1">My Dashboard</h2>
                  <p className="text-sm text-slate-400">Personal wellness insights and team activity feed.</p>
                </div>
                <div className="flex items-center gap-3">
                   <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2 border-white/10 hover:bg-white/5">
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                   </Button>
                   <AskSentinelWidget />
                </div>
              </div>

              {/* Top Stats Cards */}
              <StatCards metrics={mappedTeamMetrics} />

              {/* Main Grid Layout */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                
                {/* Left Column - Risk & Metrics */}
                <Card className="col-span-4 bg-[#111827]/50 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Shield className="h-5 w-5 text-emerald-400" />
                       Risk Factors
                    </CardTitle>
                    <CardDescription>Real-time analysis of work patterns and wellbeing indicators.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RiskAssessment riskData={riskData} useMock={!riskData} />
                  </CardContent>
                </Card>

                {/* Right Column - Activity Feed */}
                <Card className="col-span-3 bg-[#111827]/50 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Activity className="h-5 w-5 text-blue-400" />
                       Recent Activity
                    </CardTitle>
                    <CardDescription>Latest system events and alerts.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ActivityFeed events={mappedEvents} />
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                 <div className="col-span-4 bg-[#111827]/50 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-white">Velocity Trend</h3>
                    <div className="h-[300px]">
                       <VelocityChart data={history} />
                    </div>
                 </div>
                 <div className="col-span-3">
                    <NudgeCard nudge={nudgeData} />
                 </div>
              </div>
            </div>
          )}

          {/* ==================== 2. ADMIN DASHBOARD (Global Command Center) ==================== */}
          {activeView === "admin" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                     <h1 className="text-3xl font-bold tracking-tight text-white mb-2 bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
                        Platform Command Center
                     </h1>
                     <p className="text-slate-400">Global system status, organizational health, and security controls.</p>
                  </div>
                  <div className="flex gap-3">
                     <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 px-3 py-1">
                        <Shield className="w-3 h-3 mr-2" /> Admin Access
                     </Badge>
                     <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                        System Report
                     </Button>
                  </div>
               </div>

               <GlobalStatsCards />

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="col-span-2 space-y-8">
                     <OrgHealthMap />
                     <Card className="bg-[#111827]/80 border-white/10">
                        <CardHeader>
                           <CardTitle className="text-white">Recent System Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <AuditLogFeed />
                        </CardContent>
                     </Card>
                  </div>
                  <div className="col-span-1">
                     <AdminQuickActions />
                  </div>
               </div>
            </div>
          )}

          {/* ==================== 3. MANAGER DASHBOARD (Team Overview) ==================== */}
          {activeView === "team" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between">
                  <div>
                     <h1 className="text-2xl font-bold text-white">Team Dashboard</h1>
                     <p className="text-slate-400 text-sm">Manage team velocity, burnout risk, and wellbeing.</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <AnonymityToggle 
                        isAnonymized={isAnonymized} 
                        onToggle={() => setIsAnonymized(!isAnonymized)} 
                     />
                  </div>
               </div>

               {/* Team Stats Row */}
               <TeamStatsRow metrics={mappedTeamMetrics} />

               {/* Main Content Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Team Members List */}
                  <div className="lg:col-span-2">
                     <Card className="bg-[#1a1a2e] border-white/5">
                        <CardHeader>
                           <CardTitle className="text-lg flex items-center gap-2">
                              <Users className="h-5 w-5 text-blue-400" />
                              Team Members ({employees.length})
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <TeamGrid employees={employees} isAnonymized={isAnonymized} />
                        </CardContent>
                     </Card>
                  </div>

                  {/* Right Sidebar */}
                  <div className="space-y-6">
                     {/* Team Health Summary */}
                     <Card className="bg-[#1a1a2e] border-white/5">
                        <CardHeader>
                           <CardTitle className="text-lg flex items-center gap-2">
                              <Shield className="h-5 w-5 text-green-400" />
                              Team Health
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-slate-400">Healthy</span>
                              <span className="text-green-400 font-medium">{mappedTeamMetrics.healthy_count}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-slate-400">Elevated</span>
                              <span className="text-amber-400 font-medium">{mappedTeamMetrics.elevated_count}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-slate-400">Critical</span>
                              <span className="text-red-400 font-medium">{mappedTeamMetrics.critical_count}</span>
                           </div>
                           <div className="pt-2 border-t border-white/5">
                              <div className="flex justify-between items-center">
                                 <span className="text-slate-400">Avg Velocity</span>
                                 <span className="text-white font-mono">{mappedTeamMetrics.avg_velocity.toFixed(1)}</span>
                              </div>
                           </div>
                        </CardContent>
                     </Card>

                     {/* Quick Actions */}
                     <Card className="bg-[#1a1a2e] border-white/5">
                        <CardHeader>
                           <CardTitle className="text-lg flex items-center gap-2">
                              <Zap className="h-5 w-5 text-purple-400" />
                              Quick Actions
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                           <Button variant="outline" className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5">
                              <Users className="h-4 w-4 mr-2" />
                              View Team Roster
                           </Button>
                           <Button variant="outline" className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Analytics
                           </Button>
                           <Button variant="outline" className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5">
                              <Sparkles className="h-4 w-4 mr-2" />
                              Get AI Insights
                           </Button>
                        </CardContent>
                     </Card>
                  </div>
               </div>
            </div>
          )}

          {/* ==================== 4. INDIVIDUAL INSIGHTS (Drill-down) ==================== */}
          {activeView === "employee-detail" && (
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
          {activeView === "safety-valve" && <div className="text-center p-10 text-slate-400">Safety Valve Module Coming Soon</div>}
          {activeView === "talent-scout" && <div className="text-center p-10 text-slate-400">Talent Scout Module Coming Soon</div>}
          {activeView === "culture" && <div className="text-center p-10 text-slate-400">Culture Metrics Module Coming Soon</div>}

        </main>
      </ScrollArea>
    </div>
  )
}

function ViewHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
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

