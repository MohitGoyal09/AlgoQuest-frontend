"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"

import { UserSelector } from "@/components/user-selector"
import { RiskAssessment } from "@/components/risk-assessment"
import { NetworkGraph } from "@/components/network-graph"
import { VaultStatus } from "@/components/vault-status"
import { StatCards } from "@/components/stat-cards"
import { NudgeCard } from "@/components/nudge-card"
import { SkillsRadar } from "@/components/skills-radar"
import { TeamDistribution } from "@/components/team-distribution"
import { ForecastChart } from "@/components/forecast-chart"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Users, 
  Heart, 
  Network, 
  Sparkles,
  TrendingUp,
  Activity,
  AlertTriangle,
  Target,
  Zap,
  ChevronDown,
  ChevronRight
} from "lucide-react"

import { Employee, RiskLevel, toRiskLevel, NetworkNode, NetworkEdge } from "@/types"

import { useRiskData } from "@/hooks/useRiskData"
import { useNetworkData } from "@/hooks/useNetworkData"
import { useTeamData } from "@/hooks/useTeamData"
import { useRiskHistory } from "@/hooks/useRiskHistory"
import { useUsers } from "@/hooks/useUsers"
import { useNudge } from "@/hooks/useNudge"
import { useForecast } from "@/hooks/useForecast"

const ENGINE_CONFIGS = [
  {
    id: "safety",
    name: "Safety Valve",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    description: "Burnout detection & risk analysis"
  },
  {
    id: "talent",
    name: "Talent Scout",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Hidden talent & skill discovery"
  },
  {
    id: "culture",
    name: "Culture",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    description: "Team sentiment & health"
  },
  {
    id: "network",
    name: "Network",
    icon: Network,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Collaboration & connections"
  }
]

function EnginesContent() {
  const router = useRouter()
  const [selectedUserHash, setSelectedUserHash] = useState<string | null>(null)
  const [expandedEngine, setExpandedEngine] = useState<string | null>("safety")

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

  const { data: riskData } = useRiskData(selectedUserHash)
  const { data: nudgeData } = useNudge(selectedUserHash)
  const { data: networkData } = useNetworkData(selectedUserHash)
  const { data: teamData } = useTeamData()
  const { data: forecastData } = useForecast()

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

  const networkNodes = networkData?.nodes || []
  const networkEdges = networkData?.edges || []

  const mappedTeamMetrics = useMemo(() => {
    if (!teamData) return null
    const total_members = employees.length
    const healthy_count = employees.filter(e => e.risk_level === "LOW").length
    const elevated_count = employees.filter(e => e.risk_level === "ELEVATED").length
    const critical_count = employees.filter(e => e.risk_level === "CRITICAL").length
    
    return {
      total_members,
      healthy_count,
      elevated_count,
      critical_count,
      avg_velocity: teamData.metrics?.avg_velocity || 0,
    }
  }, [teamData, employees])

  const handleUserSelect = (emp: Employee) => {
    setSelectedUserHash(emp.user_hash)
  }

  const toggleEngine = (engineId: string) => {
    setExpandedEngine(expandedEngine === engineId ? null : engineId)
  }

  const hiddenGems = networkNodes.filter(n => (n as any).is_hidden_gem)

  const mockSkillsData = {
    technical: 78,
    communication: 85,
    leadership: 72,
    collaboration: 90,
    adaptability: 68,
    creativity: 75
  }

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1">
        <main className="flex flex-col gap-6 p-5 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Engines Dashboard</h2>
              <p className="text-sm text-muted-foreground">Select an engine to view its analytics</p>
            </div>
          </div>

          {/* User Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="user-select">
              Select Employee
            </label>
            <UserSelector
              employees={employees}
              selectedUser={currentEmployee}
              onSelect={handleUserSelect}
            />
          </div>

          {/* Engine Accordion */}
          <div className="space-y-3">
            {ENGINE_CONFIGS.map((engine) => {
              const isExpanded = expandedEngine === engine.id
              const Icon = engine.icon

              return (
                <Card key={engine.id} className="overflow-hidden">
                  {/* Engine Header - Clickable */}
                  <button
                    onClick={() => toggleEngine(engine.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${engine.bgColor}`}>
                        <Icon className={`h-5 w-5 ${engine.color}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">{engine.name}</h3>
                        <p className="text-sm text-muted-foreground">{engine.description}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Engine Content */}
                  {isExpanded && (
                    <CardContent className="border-t pt-6 space-y-6">
                      {/* SAFETY VALVE */}
                      {engine.id === "safety" && (
                        <>
                          {currentEmployee && (
                            <>
                              <RiskAssessment employee={currentEmployee} />
                              <NudgeCard nudge={nudgeData} />
                            </>
                          )}
                          {mappedTeamMetrics && <StatCards metrics={mappedTeamMetrics} />}
                        </>
                      )}

                      {/* TALENT SCOUT */}
                      {engine.id === "talent" && (
                        <>
                          <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Sparkles className="h-5 w-5 text-purple-500" />
                                  Skills Profile
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <SkillsRadar data={mockSkillsData} height={300} />
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Target className="h-5 w-5 text-purple-500" />
                                  Network Centrality
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Betweenness</span>
                                  <Badge variant="outline">0.72</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Eigenvector</span>
                                  <Badge variant="outline">0.85</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Collaboration Score</span>
                                  <Badge variant="outline">90%</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {hiddenGems.length > 0 && (
                            <Card className="border-purple-200 bg-purple-50/50">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-700">
                                  <Sparkles className="h-5 w-5" />
                                  Hidden Gems Detected
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {hiddenGems.slice(0, 5).map((node: any, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700">
                                      {node.id?.slice(0, 8)}...
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}

                      {/* CULTURE */}
                      {engine.id === "culture" && (
                        <>
                          {mappedTeamMetrics && <StatCards metrics={mappedTeamMetrics} />}
                          <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Heart className="h-5 w-5 text-pink-500" />
                                  Team Distribution
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <TeamDistribution teamData={teamData} />
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <TrendingUp className="h-5 w-5 text-pink-500" />
                                  Forecast
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ForecastChart />
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}

                      {/* NETWORK */}
                      {engine.id === "network" && (
                        <>
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Network className="h-5 w-5 text-blue-500" />
                                Team Network Graph
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                              <NetworkGraph 
                                nodes={networkNodes} 
                                edges={networkEdges} 
                                height={380}
                              />
                            </CardContent>
                          </Card>

                          <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Team Density</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">0.72</div>
                                <p className="text-xs text-muted-foreground">Collaboration strength</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Avg. Path Length</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">2.3</div>
                                <p className="text-xs text-muted-foreground">Degrees of separation</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Islands</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">1</div>
                                <p className="text-xs text-muted-foreground">Disconnected groups</p>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </main>
      </ScrollArea>
    </div>
  )
}

export default function EnginesPage() {
  return (
    <ProtectedRoute>
      <EnginesContent />
    </ProtectedRoute>
  )
}
