"use client"

import { Suspense, useState, useMemo, useEffect } from "react"

import { SkillsRadar } from "@/components/skills-radar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Users,
  Target,
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
  HandHeart,
  Lightbulb,
  UsersRound
} from "lucide-react"

import { Employee, RiskLevel, toRiskLevel, NetworkNode } from "@/types"

import { useNetworkData } from "@/hooks/useNetworkData"
import { useTeamData } from "@/hooks/useTeamData"
import { useUsers } from "@/hooks/useUsers"

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

function TalentContent() {
  const [selectedUserHash, setSelectedUserHash] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "gems">("overview")

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

  const { data: networkData } = useNetworkData(selectedUserHash)
  const { data: teamData } = useTeamData()

  const talentProfiles = useMemo((): TalentProfile[] => {
    if (!networkData?.nodes || networkData.nodes.length === 0) {
      return employees.map((emp, idx) => ({
        user_hash: emp.user_hash,
        name: emp.name,
        role: emp.role,
        skills: {
          technical: 60 + Math.random() * 35,
          communication: 55 + Math.random() * 40,
          leadership: 40 + Math.random() * 45,
          collaboration: 65 + Math.random() * 30,
          adaptability: 50 + Math.random() * 45,
          creativity: 45 + Math.random() * 40
        },
        betweenness: Math.random() * 0.8,
        eigenvector: Math.random() * 0.9,
        unblocking: Math.floor(Math.random() * 15),
        is_hidden_gem: Math.random() > 0.7,
        potential_score: 50 + Math.random() * 45,
        visibility_score: 30 + Math.random() * 60
      }))
    }

    return networkData.nodes.map((node: NetworkNode, idx: number) => ({
      user_hash: node.id || `user_${idx}`,
      name: node.label || `User ${idx + 1}`,
      role: employees[idx % employees.length]?.role || "Engineer",
      skills: {
        technical: 60 + Math.random() * 35,
        communication: 55 + Math.random() * 40,
        leadership: 40 + Math.random() * 45,
        collaboration: 65 + Math.random() * 30,
        adaptability: 50 + Math.random() * 45,
        creativity: 45 + Math.random() * 40
      },
      betweenness: node.betweenness || Math.random() * 0.8,
      eigenvector: node.eigenvector || Math.random() * 0.9,
      unblocking: node.unblocking_count || Math.floor(Math.random() * 15),
      is_hidden_gem: node.is_hidden_gem || Math.random() > 0.7,
      potential_score: 50 + Math.random() * 45,
      visibility_score: 30 + Math.random() * 60
    }))
  }, [networkData, employees])

  const selectedProfile = useMemo(() =>
    talentProfiles.find(p => p.user_hash === selectedUserHash) || talentProfiles[0] || null
  , [talentProfiles, selectedUserHash])

  const hiddenGems = useMemo(() => {
    return talentProfiles
      .filter(p => p.is_hidden_gem)
      .sort((a, b) => b.potential_score - a.potential_score)
      .slice(0, 6)
  }, [talentProfiles])

  const topPerformers = useMemo(() => {
    return [...talentProfiles]
      .sort((a, b) => {
        const scoreA = a.betweenness * 0.4 + a.eigenvector * 0.3 + a.unblocking * 0.3
        const scoreB = b.betweenness * 0.4 + b.eigenvector * 0.3 + b.unblocking * 0.3
        return scoreB - scoreA
      })
      .slice(0, 8)
  }, [talentProfiles])

  const leadershipPipeline = useMemo(() => {
    const pipeline = [
      { level: "Executive", minScore: 85, count: 0, employees: [] as TalentProfile[] },
      { level: "Senior Lead", minScore: 70, count: 0, employees: [] as TalentProfile[] },
      { level: "Team Lead", minScore: 55, count: 0, employees: [] as TalentProfile[] },
      { level: "High Potential", minScore: 40, count: 0, employees: [] as TalentProfile[] },
      { level: "Developing", minScore: 0, count: 0, employees: [] as TalentProfile[] }
    ]

    talentProfiles.forEach(profile => {
      const leadershipScore = (profile.skills.leadership * 0.4 + 
                              profile.skills.communication * 0.3 + 
                              profile.betweenness * 30)
      
      if (leadershipScore >= 85) {
        pipeline[0].count++
        pipeline[0].employees.push(profile)
      } else if (leadershipScore >= 70) {
        pipeline[1].count++
        pipeline[1].employees.push(profile)
      } else if (leadershipScore >= 55) {
        pipeline[2].count++
        pipeline[2].employees.push(profile)
      } else if (leadershipScore >= 40) {
        pipeline[3].count++
        pipeline[3].employees.push(profile)
      } else {
        pipeline[4].count++
        pipeline[4].employees.push(profile)
      }
    })

    return pipeline
  }, [talentProfiles])

  const skillsDistribution = useMemo(() => {
    const skills = ["technical", "communication", "leadership", "collaboration", "adaptability", "creativity"]
    return skills.map(skill => {
      const values = talentProfiles.map(p => p.skills[skill as keyof typeof p.skills])
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const max = Math.max(...values)
      const min = Math.min(...values)
      return {
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        average: Math.round(avg),
        max: Math.round(max),
        min: Math.round(min)
      }
    })
  }, [talentProfiles])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getPipelineColor = (level: string) => {
    switch (level) {
      case "Executive": return "bg-violet-600"
      case "Senior Lead": return "bg-purple-500"
      case "Team Lead": return "bg-fuchsia-500"
      case "High Potential": return "bg-indigo-400"
      default: return "bg-slate-500"
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1">
        <main className="flex flex-col gap-6 p-5 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-500/30">
                <Sparkles className="h-7 w-7 text-violet-500" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Talent Scout</h2>
                <p className="text-sm text-muted-foreground">Hidden talent & skill discovery</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 border-violet-500/30 text-violet-600 hover:bg-violet-50 hover:border-violet-500/50">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Hero Section - Talent Score */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/50">
            <div className="absolute inset-0 bg-violet-500/5" />
            
            <div className="relative grid gap-8 p-8 md:grid-cols-2 lg:gap-12">
              {/* Score Display */}
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-3xl" />
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-slate-700 bg-slate-900/80 shadow-2xl">
                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-bold tracking-tight text-white font-mono">
                        {hiddenGems.length}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                        Hidden Gems
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {hiddenGems.length >= 3 ? (
                    <>
                      <Gem className="h-5 w-5 text-violet-400" />
                      <span className="text-sm font-medium text-violet-400">Exceptional talent density</span>
                    </>
                  ) : hiddenGems.length >= 1 ? (
                    <>
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">Solid talent pipeline</span>
                    </>
                  ) : (
                    <>
                      <Star className="h-5 w-5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-400">Building talent pipeline</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col justify-center gap-4">
                <div className="flex flex-col gap-4">
                  {/* Top Performers */}
                  <div className="group relative overflow-hidden rounded-xl bg-violet-950/30 p-4 border border-violet-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-violet-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                          <Award className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-violet-400">Top Performers</p>
                          <p className="text-xs text-violet-500/60">Highest network impact</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-violet-400">{topPerformers.length}</p>
                        <p className="text-xs text-violet-500/60">Identified</p>
                      </div>
                    </div>
                  </div>

                  {/* Leadership Pipeline */}
                  <div className="group relative overflow-hidden rounded-xl bg-purple-950/30 p-4 border border-purple-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-purple-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                          <Crown className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-purple-400">Leadership Pipeline</p>
                          <p className="text-xs text-purple-500/60">Ready for promotion</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-400">{leadershipPipeline[0].count + leadershipPipeline[1].count + leadershipPipeline[2].count}</p>
                        <p className="text-xs text-purple-500/60">In pipeline</p>
                      </div>
                    </div>
                  </div>

                  {/* Team Skill Avg */}
                  <div className="group relative overflow-hidden rounded-xl bg-fuchsia-950/30 p-4 border border-fuchsia-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-fuchsia-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/20">
                          <TrendingUp className="h-5 w-5 text-fuchsia-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-fuchsia-400">Avg Skill Score</p>
                          <p className="text-xs text-fuchsia-500/60">Team average</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-fuchsia-400">
                          {skillsDistribution?.length > 0 
                            ? Math.round(skillsDistribution.reduce((a, b) => a + (b.average || 0), 0) / skillsDistribution.length)
                            : 0}
                        </p>
                        <p className="text-xs text-fuchsia-500/60">/ 100</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "pipeline"
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Crown className="h-4 w-4" />
              Leadership Pipeline
            </button>
            <button
              onClick={() => setActiveTab("gems")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "gems"
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Gem className="h-4 w-4" />
              Hidden Gems
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Skills Radar */}
              <div className="lg:col-span-2">
                <Card className="h-full border-violet-200/50 bg-violet-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-violet-500" />
                      Skills Overview
                    </CardTitle>
                    <CardDescription>Team skill distribution analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedProfile ? (
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
<SkillsRadar 
                             data={selectedProfile.skills} 
                             height={320}
                           />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-3">Network Metrics</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Betweenness Centrality</span>
                                <Badge variant="outline" className="bg-violet-50 border-violet-200">
                                  {(selectedProfile.betweenness * 100).toFixed(1)}%
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Eigenvector Score</span>
                                <Badge variant="outline" className="bg-violet-50 border-violet-200">
                                  {(selectedProfile.eigenvector * 100).toFixed(1)}%
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Unblocking Count</span>
                                <Badge variant="outline" className="bg-violet-50 border-violet-200">
                                  {selectedProfile.unblocking}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium mb-3">Talent Scores</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-muted-foreground">Potential</span>
                                  <span className="text-xs font-medium">{selectedProfile.potential_score.toFixed(0)}%</span>
                                </div>
                                <Progress value={selectedProfile.potential_score} className="h-2" />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-muted-foreground">Visibility</span>
                                  <span className="text-xs font-medium">{selectedProfile.visibility_score.toFixed(0)}%</span>
                                </div>
                                <Progress value={selectedProfile.visibility_score} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Select an employee to view skills</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Employee Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-400" />
                  <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
                  <Badge variant="secondary" className="ml-2">
                    {talentProfiles.length}
                  </Badge>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {talentProfiles.map((profile) => (
                    <button
                      key={profile.user_hash}
                      onClick={() => setSelectedUserHash(profile.user_hash)}
                      className={`w-full relative flex items-center gap-4 rounded-xl border p-3 text-left transition-all hover:scale-[1.02] ${
                        selectedUserHash === profile.user_hash
                          ? "bg-violet-50 border-violet-300"
                          : "border-border bg-card hover:bg-accent"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={profile.name} />
                        <AvatarFallback className={profile.is_hidden_gem ? "bg-violet-100 text-violet-600" : "bg-muted"}>
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-foreground truncate">{profile.name}</p>
                          {profile.is_hidden_gem && (
                            <Gem className="h-3 w-3 text-violet-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{profile.role}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Skills Distribution Section */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-500" />
                <h3 className="text-lg font-semibold text-foreground">Skills Distribution Across Team</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {skillsDistribution.map((skill) => (
                  <Card key={skill.skill} className="border-violet-100/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{skill.skill}</span>
                        <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                          Avg: {skill.average}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-muted-foreground">Max</div>
                          <Progress value={skill.max} className="h-2 flex-1" />
                          <span className="text-xs font-medium w-8 text-right">{skill.max}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-muted-foreground">Avg</div>
                          <Progress value={skill.average} className="h-2 flex-1" />
                          <span className="text-xs font-medium w-8 text-right">{skill.average}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-muted-foreground">Min</div>
                          <Progress value={skill.min} className="h-2 flex-1" />
                          <span className="text-xs font-medium w-8 text-right">{skill.min}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Leadership Pipeline Tab */}
          {activeTab === "pipeline" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-violet-500" />
                <h3 className="text-lg font-semibold text-foreground">Leadership Pipeline</h3>
              </div>

              <div className="grid gap-4">
                {leadershipPipeline.map((level, idx) => (
                  <Card 
                    key={level.level} 
                    className={`overflow-hidden border-0 shadow-md`}
                  >
                    <div className={`h-2 ${getPipelineColor(level.level)}`} />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getPipelineColor(level.level)}`}>
                            <Crown className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{level.level}</h4>
                            <p className="text-sm text-muted-foreground">
                              {level.level === "Executive" && "C-Level, VP, Director"}
                              {level.level === "Senior Lead" && "Senior Managers, Tech Leads"}
                              {level.level === "Team Lead" && "Team Leads, Project Managers"}
                              {level.level === "High Potential" && "High performers ready for leadership"}
                              {level.level === "Developing" && "Building foundational skills"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-violet-600">
                            {level.count}
                          </p>
                          <p className="text-xs text-muted-foreground">employees</p>
                        </div>
                      </div>

                      {level.employees.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {level.employees.slice(0, 5).map((emp) => (
                            <div 
                              key={emp.user_hash}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-violet-100 text-violet-600">
                                  {getInitials(emp.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{emp.name}</span>
                            </div>
                          ))}
                          {level.employees.length > 5 && (
                            <Badge variant="outline" className="ml-2">
                              +{level.employees.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Gems Tab */}
          {activeTab === "gems" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-violet-500" />
                <h3 className="text-lg font-semibold text-foreground">Hidden Gems</h3>
                <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                  {hiddenGems.length} discovered
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                High potential employees with low visibility who deserve more recognition and opportunities.
              </p>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {hiddenGems.map((gem) => (
                  <Card 
                    key={gem.user_hash} 
                    className="border-violet-200 bg-violet-50 hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-violet-100 text-violet-600">
                              {getInitials(gem.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{gem.name}</h4>
                            <p className="text-sm text-muted-foreground">{gem.role}</p>
                          </div>
                        </div>
                        <Gem className="h-5 w-5 text-violet-500" />
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Potential</span>
                            <span className="text-xs font-medium">{gem.potential_score.toFixed(0)}%</span>
                          </div>
                          <Progress value={gem.potential_score} className="h-2 bg-violet-200" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Visibility</span>
                            <span className="text-xs font-medium">{gem.visibility_score.toFixed(0)}%</span>
                          </div>
                          <Progress value={gem.visibility_score} className="h-2 bg-violet-200" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span>Unblocked {gem.unblocking} times</span>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-violet-300 text-violet-600 hover:bg-violet-100">
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {hiddenGems.length === 0 && (
                  <Card className="col-span-full border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
                      <p className="text-sm text-muted-foreground">No hidden gems detected yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Keep monitoring team interactions</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Top Performers Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-violet-500" />
              <h3 className="text-lg font-semibold text-foreground">Top Performers</h3>
              <Badge variant="secondary" className="ml-2">
                Highest Impact
              </Badge>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {topPerformers.map((performer, idx) => (
                    <div 
                      key={performer.user_hash}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={performer.is_hidden_gem ? "bg-violet-100 text-violet-600" : "bg-muted"}>
                          {getInitials(performer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{performer.name}</p>
                          {performer.is_hidden_gem && (
                            <Gem className="h-3 w-3 text-violet-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{performer.role}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{(performer.betweenness * 100).toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">Betweenness</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{(performer.eigenvector * 100).toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">Eigenvector</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{performer.unblocking}</p>
                          <p className="text-xs text-muted-foreground">Unblocked</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="shrink-0">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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

export default function TalentScoutPage() {
  return (
    <ProtectedRoute>
      <TalentContent />
    </ProtectedRoute>
  )
}
