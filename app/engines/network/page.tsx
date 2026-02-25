"use client"

import { useState, useMemo } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NetworkGraph } from "@/components/network-graph"
import {
  Network,
  Users,
  Share2,
  MessageCircle,
  Link2,
  Target,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Circle,
  Webhook,
  GitBranch,
  Clock,
  RefreshCw,
  Info,
  Zap,
  Layers,
  Crosshair,
  Unplug,
  Gauge,
  Activity
} from "lucide-react"

interface Connector {
  id: string
  name: string
  role: string
  connections: number
  influence: number
  avatar: string
}

interface Cluster {
  id: string
  name: string
  members: number
  density: number
  color: string
}

interface SiloMember {
  id: string
  name: string
  role: string
  connections: number
  risk: "high" | "medium" | "low"
}

function NetworkContent() {
  const [activeTab, setActiveTab] = useState<"overview" | "connectors" | "patterns" | "silos">("overview")

  const networkNodes = useMemo(() => {
    const names = [
      "Sarah Chen", "Mike Johnson", "Emily Davis", "Alex Kim", "Jordan Lee",
      "Taylor Swift", "Chris Martin", "Pat Riley", "Sam Wilson", "Jamie Oliver",
      "Riley Cooper", "Morgan Freeman", "Casey Jones", "Quinn Hughes", "Drew Barrymore",
      "Skyler White", "Avery Brown", "Reese Witherspoon", "Charlie Puth", "Harper Lee"
    ]
    const roles = ["Engineer", "Designer", "Manager", "Analyst", "Lead", "Director"]
    const riskLevels = ["healthy", "healthy", "healthy", "elevated", "critical"] as const

    return names.map((name, idx) => ({
      id: `node-${idx}`,
      label: name,
      risk_level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      betweenness: Math.random() * 0.5,
      eigenvector: Math.random() * 0.8,
      unblocking_count: Math.floor(Math.random() * 10),
      is_hidden_gem: idx < 3
    }))
  }, [])

  const networkEdges = useMemo(() => {
    const edges: { source: string; target: string; weight: number; edge_type: string }[] = []
    
    for (let i = 0; i < networkNodes.length; i++) {
      const connections = Math.floor(Math.random() * 4) + 1
      for (let j = 0; j < connections; j++) {
        const targetIdx = Math.floor(Math.random() * networkNodes.length)
        if (targetIdx !== i) {
          edges.push({
            source: `node-${i}`,
            target: `node-${targetIdx}`,
            weight: Math.random() * 3 + 1,
            edge_type: ["collaboration", "mentorship", "reporting"][Math.floor(Math.random() * 3)]
          })
        }
      }
    }
    return edges
  }, [networkNodes])

  const connectivityMetrics = useMemo(() => {
    return {
      density: 0.65 + Math.random() * 0.25,
      avgClustering: 0.55 + Math.random() * 0.3,
      diameter: Math.floor(Math.random() * 3) + 2,
      components: Math.floor(Math.random() * 2) + 1,
      totalEdges: networkEdges.length,
      avgDegree: (networkEdges.length * 2 / networkNodes.length).toFixed(1)
    }
  }, [networkNodes, networkEdges])

  const keyConnectors = useMemo((): Connector[] => {
    const connectors: Connector[] = [
      { id: "1", name: "Sarah Chen", role: "Tech Lead", connections: 45, influence: 92, avatar: "SC" },
      { id: "2", name: "Mike Johnson", role: "Engineering Manager", connections: 38, influence: 88, avatar: "MJ" },
      { id: "3", name: "Emily Davis", role: "Senior Architect", connections: 42, influence: 85, avatar: "ED" },
      { id: "4", name: "Alex Kim", role: "Product Manager", connections: 35, influence: 78, avatar: "AK" },
      { id: "5", name: "Jordan Lee", role: "Team Lead", connections: 31, influence: 72, avatar: "JL" }
    ]
    return connectors
  }, [])

  const clusters = useMemo((): Cluster[] => {
    return [
      { id: "1", name: "Engineering Core", members: 8, density: 0.78, color: "from-cyan-500 to-blue-500" },
      { id: "2", name: "Product Team", members: 5, density: 0.85, color: "from-blue-500 to-indigo-500" },
      { id: "3", name: "Design Hub", members: 4, density: 0.72, color: "from-indigo-500 to-purple-500" },
      { id: "4", name: "Operations", members: 3, density: 0.65, color: "from-purple-500 to-pink-500" }
    ]
  }, [])

  const communicationPatterns = useMemo(() => {
    return [
      { type: "Cross-team Collaboration", frequency: 42, trend: 8, color: "cyan" },
      { type: "Within Team", frequency: 35, trend: -3, color: "blue" },
      { type: "Management Cascade", frequency: 15, trend: 2, color: "indigo" },
      { type: "External Partners", frequency: 8, trend: 5, color: "purple" }
    ]
  }, [])

  const siloMembers = useMemo((): SiloMember[] => {
    return [
      { id: "1", name: "Riley Cooper", role: "Data Analyst", connections: 3, risk: "high" },
      { id: "2", name: "Morgan Freeman", role: "QA Lead", connections: 4, risk: "high" },
      { id: "3", name: "Casey Jones", role: "Backend Dev", connections: 5, risk: "medium" },
      { id: "4", name: "Quinn Hughes", role: "Support Lead", connections: 6, risk: "medium" },
      { id: "5", name: "Drew Barrymore", role: "Content Writer", connections: 7, risk: "low" }
    ]
  }, [])

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "high": return "bg-red-100 text-red-700 border-red-200"
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default: return "bg-green-100 text-green-700 border-green-200"
    }
  }

  const getClusterColor = (color: string) => {
    switch (color) {
      case "cyan": return "bg-cyan-500"
      case "blue": return "bg-blue-500"
      case "indigo": return "bg-indigo-500"
      default: return "bg-purple-500"
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1">
        <main className="flex flex-col gap-6 p-5 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/30">
                <Network className="h-7 w-7 text-cyan-500" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Network Engine</h2>
                <p className="text-sm text-muted-foreground">Team connectivity & communication analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 border-cyan-300 text-cyan-600 bg-cyan-50">
                <Activity className="h-3 w-3" />
                Live
              </Badge>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-cyan-300 text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Hero Section - Network Overview */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/50">
            <div className="absolute inset-0 bg-cyan-500/5" />
            
            <div className="relative grid gap-8 p-8 md:grid-cols-2 lg:gap-12">
              {/* Network Density Gauge */}
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl" />
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-slate-700 bg-slate-900/80 shadow-2xl">
                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-bold tracking-tight text-white font-mono">
                        {(connectivityMetrics.density * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                        Network Density
                      </span>
                    </div>
                  </div>
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-medium text-white ${connectivityMetrics.density > 0.7 ? 'bg-green-500' : connectivityMetrics.density > 0.5 ? 'bg-cyan-500' : 'bg-yellow-500'}`}>
                    {connectivityMetrics.density > 0.7 ? "Strong" : connectivityMetrics.density > 0.5 ? "Healthy" : "Developing"}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-400">{connectivityMetrics.totalEdges} active connections</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col justify-center gap-4">
                <div className="flex flex-col gap-4">
                  {/* Average Clustering */}
                  <div className="group relative overflow-hidden rounded-xl bg-cyan-950/30 p-4 border border-cyan-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-cyan-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                          <Layers className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-cyan-400">Avg. Clustering</p>
                          <p className="text-xs text-cyan-500/60">Team cohesion</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-400">{(connectivityMetrics.avgClustering * 100).toFixed(0)}%</p>
                        <p className="text-xs text-cyan-500/60">Coefficient</p>
                      </div>
                    </div>
                  </div>

                  {/* Network Diameter */}
                  <div className="group relative overflow-hidden rounded-xl bg-blue-950/30 p-4 border border-blue-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-blue-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                          <Crosshair className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-400">Network Diameter</p>
                          <p className="text-xs text-blue-500/60">Max hops between</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">{connectivityMetrics.diameter}</p>
                        <p className="text-xs text-blue-500/60">degrees</p>
                      </div>
                    </div>
                  </div>

                  {/* Components */}
                  <div className="group relative overflow-hidden rounded-xl bg-indigo-950/30 p-4 border border-indigo-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-indigo-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
                          <GitBranch className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-indigo-400">Connected Groups</p>
                          <p className="text-xs text-indigo-500/60">Network components</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-400">{connectivityMetrics.components}</p>
                        <p className="text-xs text-indigo-500/60">components</p>
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
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Gauge className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("connectors")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "connectors"
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Target className="h-4 w-4" />
              Key Connectors
            </button>
            <button
              onClick={() => setActiveTab("patterns")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "patterns"
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Patterns
            </button>
            <button
              onClick={() => setActiveTab("silos")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "silos"
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Unplug className="h-4 w-4" />
              Silos & Isolated
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Network Graph */}
              <div className="h-[500px]">
                <NetworkGraph nodes={networkNodes} edges={networkEdges} />
              </div>

              {/* Network Metrics */}
              <div className="grid gap-6 lg:grid-cols-4">
                <Card className="border-cyan-200/50 bg-cyan-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-cyan-500" />
                      Total Connections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-cyan-600">{connectivityMetrics.totalEdges}</p>
                    <p className="text-xs text-muted-foreground mt-1">edges in network</p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200/50 bg-blue-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      Avg. Degree
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{connectivityMetrics.avgDegree}</p>
                    <p className="text-xs text-muted-foreground mt-1">connections per person</p>
                  </CardContent>
                </Card>

                <Card className="border-indigo-200/50 bg-indigo-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-indigo-500" />
                      Clustering Coefficient
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-indigo-600">{(connectivityMetrics.avgClustering).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">0-1 scale</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200/50 bg-purple-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Circle className="h-4 w-4 text-purple-500" />
                      Network Diameter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-600">{connectivityMetrics.diameter}</p>
                    <p className="text-xs text-muted-foreground mt-1">max degrees of separation</p>
                  </CardContent>
                </Card>
              </div>

              {/* Clusters */}
              <Card className="border-cyan-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-cyan-500" />
                    Team Clusters
                  </CardTitle>
                  <CardDescription>Identified groups within the organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {clusters.map((cluster) => (
                      <div 
                        key={cluster.id}
                        className="relative overflow-hidden rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
                      >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${cluster.color} opacity-10 rounded-bl-full`} />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cluster.color} text-white`}>
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{cluster.name}</p>
                              <p className="text-xs text-muted-foreground">{cluster.members} members</p>
                            </div>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-2xl font-bold text-foreground">{(cluster.density * 100).toFixed(0)}%</p>
                              <p className="text-xs text-muted-foreground">Density</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                              <div className={`h-3 w-3 rounded-full ${cluster.color}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Key Connectors Tab */}
          {activeTab === "connectors" && (
            <div className="space-y-6">
              <Card className="border-cyan-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-cyan-500" />
                    Key Connectors & Influencers
                  </CardTitle>
                  <CardDescription>Team members who bridge groups and drive collaboration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {keyConnectors.map((connector, idx) => (
                      <div 
                        key={connector.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-cyan-100 hover:bg-cyan-50/50 transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold">
                          {idx + 1}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-cyan-100 text-cyan-700 font-semibold">
                            {connector.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{connector.name}</p>
                            {connector.influence >= 85 && (
                              <Badge variant="outline" className="border-cyan-300 text-cyan-600 bg-cyan-50">
                                <Zap className="h-3 w-3 mr-1" />
                                Top Influencer
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{connector.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-cyan-600">{connector.connections}</p>
                          <p className="text-xs text-muted-foreground">connections</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{connector.influence}%</p>
                          <p className="text-xs text-muted-foreground">influence</p>
                        </div>
                        <div className="w-32">
                          <Progress value={connector.influence} className="h-2 bg-cyan-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Hidden Gems */}
              <Card className="border-cyan-200/50 bg-cyan-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-cyan-500" />
                    Hidden Gems
                  </CardTitle>
                  <CardDescription>High-potential connectors with significant network impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {networkNodes.filter(n => n.is_hidden_gem).slice(0, 3).map((node, idx) => (
                      <div 
                        key={node.id}
                        className="p-4 rounded-xl bg-[#0f172a] border border-cyan-900/30"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-cyan-500 text-white">
                              {node.label.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{node.label}</p>
                            <p className="text-xs text-muted-foreground">Hidden Gem</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 rounded bg-cyan-50">
                            <p className="text-xs text-muted-foreground">Betweenness</p>
                            <p className="font-semibold text-cyan-700">{(node.betweenness || 0).toFixed(3)}</p>
                          </div>
                          <div className="p-2 rounded bg-blue-50">
                            <p className="text-xs text-muted-foreground">Unblocking</p>
                            <p className="font-semibold text-blue-700">{node.unblocking_count || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Communication Patterns Tab */}
          {activeTab === "patterns" && (
            <div className="space-y-6">
              <Card className="border-cyan-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-cyan-500" />
                    Communication Patterns
                  </CardTitle>
                  <CardDescription>How information flows through the organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {communicationPatterns.map((pattern, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${getClusterColor(pattern.color)}`} />
                            <span className="font-medium">{pattern.type}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold">{pattern.frequency}%</span>
                            <div className={`flex items-center gap-1 text-xs ${pattern.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pattern.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {Math.abs(pattern.trend)}%
                            </div>
                          </div>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500`}
                            style={{ width: `${pattern.frequency}%`, backgroundColor: pattern.color === 'cyan' ? '#06b6d4' : pattern.color === 'blue' ? '#3b82f6' : pattern.color === 'indigo' ? '#6366f1' : '#a855f7' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Communication Flow */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-cyan-200/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Webhook className="h-4 w-4 text-cyan-500" />
                      Information Flow Direction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { direction: "Top-Down", percentage: 45, color: "bg-cyan-500" },
                        { direction: "Bottom-Up", percentage: 25, color: "bg-blue-500" },
                        { direction: "Horizontal", percentage: 30, color: "bg-indigo-500" }
                      ].map((flow, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{flow.direction}</span>
                            <span className="text-sm font-medium">{flow.percentage}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${flow.color} rounded-full`}
                              style={{ width: `${flow.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Peak Communication Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { time: "Morning (9-11 AM)", activity: 85, label: "Peak" },
                        { time: "Mid-day (11 AM-2 PM)", activity: 65, label: "Moderate" },
                        { time: "Afternoon (2-5 PM)", activity: 75, label: "High" },
                        { time: "Evening (5-7 PM)", activity: 35, label: "Low" }
                      ].map((period, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{period.time}</span>
                            <Badge variant="outline" className={period.activity >= 75 ? "bg-cyan-50 border-cyan-200 text-cyan-700" : "bg-slate-50"}>
                              {period.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-cyan-500 rounded-full"
                                style={{ width: `${period.activity}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-cyan-600 w-8">{period.activity}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Silos Tab */}
          {activeTab === "silos" && (
            <div className="space-y-6">
              {/* Warning Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-red-50 border border-red-200 p-6">
                <div className="absolute right-0 top-0 h-full w-32 bg-red-100/50" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Potential Silos Detected</h3>
                    <p className="text-sm text-red-600/80">5 team members have limited network connections</p>
                  </div>
                </div>
              </div>

              {/* Isolated Members List */}
              <Card className="border-cyan-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Unplug className="h-5 w-5 text-cyan-500" />
                    Isolated Team Members
                  </CardTitle>
                  <CardDescription>Members with limited connections who may benefit from more collaboration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {siloMembers.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{member.name}</p>
                            {member.risk === "high" && (
                              <Badge className={getRiskBadge(member.risk)}>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                High Risk
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{member.connections}</p>
                          <p className="text-xs text-muted-foreground">connections</p>
                        </div>
                        <div className="w-24">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${member.risk === 'high' ? 'bg-red-500' : member.risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${(member.connections / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                        <button className="px-3 py-1.5 text-sm text-cyan-600 border border-cyan-300 rounded-lg hover:bg-cyan-50 transition-colors">
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-cyan-200/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-500" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { title: "Cross-functional Projects", desc: "Assign isolated members to cross-team initiatives", icon: "🤝" },
                        { title: "Mentorship Program", desc: "Pair with well-connected team members", icon: "👥" },
                        { title: "Team Lunches", desc: "Create informal connection opportunities", icon: "🍽️" },
                        { title: "Knowledge Sessions", desc: "Encourage sharing expertise across teams", icon: "📚" }
                      ].map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-cyan-50 transition-colors">
                          <span className="text-xl">{rec.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{rec.title}</p>
                            <p className="text-xs text-muted-foreground">{rec.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Connection Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { from: "Riley Cooper", to: "Sarah Chen", reason: "Similar project interests" },
                        { from: "Morgan Freeman", to: "Mike Johnson", reason: "Same department" },
                        { from: "Casey Jones", to: "Emily Davis", reason: "Technical complement" }
                      ].map((suggestion, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-blue-100">
                          <div className="flex-1 text-right">
                            <p className="text-sm font-medium">{suggestion.from}</p>
                          </div>
                          <div className="flex items-center gap-2 px-2">
                            <div className="h-0.5 w-8 bg-blue-300" />
                            <Share2 className="h-4 w-4 text-blue-400" />
                            <div className="h-0.5 w-8 bg-blue-300" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{suggestion.to}</p>
                          </div>
                          <p className="text-xs text-muted-foreground w-32">{suggestion.reason}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

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

export default function NetworkEnginePage() {
  return (
    <ProtectedRoute>
      <NetworkContent />
    </ProtectedRoute>
  )
}
