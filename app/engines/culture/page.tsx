"use client"

import { useState, useMemo } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart,
  Smile,
  Frown,
  Meh,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Moon,
  Sun,
  Zap,
  Coffee,
  Calendar,
  Activity,
  HeartHandshake,
  MessageCircle,
  PartyPopper,
  Sparkles,
  BarChart3,
  RefreshCw,
  Info
} from "lucide-react"

import { useUsers } from "@/hooks/useUsers"

interface MoodData {
  date: string
  score: number
  positive: number
  neutral: number
  negative: number
}

interface CultureMetric {
  label: string
  value: number
  change: number
  icon: React.ElementType
}

function CultureContent() {
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "balance">("overview")
  const { users, isLoading: usersLoading } = useUsers()

  const teamSentiment = useMemo(() => {
    const sentiments = ["positive", "neutral", "negative"]
    const weights = [0.45, 0.35, 0.20]
    const randomSentiment = Math.random()
    let sentiment: string
    
    if (randomSentiment < 0.45) sentiment = "positive"
    else if (randomSentiment < 0.80) sentiment = "neutral"
    else sentiment = "negative"
    
    return {
      overall: sentiment,
      score: 65 + Math.random() * 25,
      breakdown: {
        positive: 45 + Math.random() * 30,
        neutral: 25 + Math.random() * 25,
        negative: 5 + Math.random() * 15
      }
    }
  }, [])

  const cultureTemperature = useMemo(() => {
    const temp = 60 + Math.random() * 30
    let status: "hot" | "warm" | "cool" | "cold"
    let message: string
    
    if (temp >= 75) {
      status = "hot"
      message = "Team culture is thriving! 🚀"
    } else if (temp >= 55) {
      status = "warm"
      message = "Healthy team culture with room to grow"
    } else if (temp >= 35) {
      status = "cool"
      message = "Culture needs attention"
    } else {
      status = "cold"
      message = "Critical: Culture intervention needed"
    }
    
    return { value: temp, status, message }
  }, [])

  const collaborationTrends = useMemo((): CultureMetric[] => {
    return [
      { label: "Cross-team Projects", value: 72 + Math.random() * 20, change: 5 + Math.random() * 10, icon: Users },
      { label: "Knowledge Sharing", value: 65 + Math.random() * 25, change: -2 + Math.random() * 8, icon: MessageCircle },
      { label: "Team Bonding Events", value: 50 + Math.random() * 30, change: 10 + Math.random() * 15, icon: PartyPopper },
      { label: "Peer Recognition", value: 60 + Math.random() * 30, change: 3 + Math.random() * 12, icon: HeartHandshake }
    ]
  }, [])

  const workLifeBalance = useMemo((): CultureMetric[] => {
    return [
      { label: "Avg. Work Hours", value: 38 + Math.random() * 12, change: -1 + Math.random() * 3, icon: Clock },
      { label: "PTO Utilization", value: 60 + Math.random() * 30, change: 5 + Math.random() * 10, icon: Calendar },
      { label: "After-hours Activity", value: 15 + Math.random() * 20, change: -3 + Math.random() * 6, icon: Moon },
      { label: "Meeting Load", value: 45 + Math.random() * 25, change: -2 + Math.random() * 4, icon: Coffee }
    ]
  }, [])

  const moodOverTime = useMemo((): MoodData[] => {
    const data: MoodData[] = []
    const today = new Date()
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const baseScore = 60 + Math.random() * 20
      const trend = (30 - i) * 0.2
      
      data.push({
        date: date.toISOString().split('T')[0],
        score: Math.min(100, Math.max(0, baseScore + trend)),
        positive: 30 + Math.random() * 30,
        neutral: 20 + Math.random() * 25,
        negative: 5 + Math.random() * 15
      })
    }
    
    return data
  }, [])

  const recentMoodHighlights = useMemo(() => {
    return [
      { emoji: "🎉", text: "Team celebration yesterday", type: "positive" },
      { emoji: "💪", text: "Successful project launch", type: "positive" },
      { emoji: "☕", text: "New coffee machine installed", type: "neutral" },
      { emoji: "🏃", text: "Team building event planned", type: "positive" },
      { emoji: "😰", text: "Deadline pressure noted", type: "negative" }
    ].slice(0, 4)
  }, [])

  const getTemperatureColor = (status: string) => {
    switch (status) {
      case "hot": return "from-rose-500 to-pink-500"
      case "warm": return "from-pink-400 to-rose-400"
      case "cool": return "from-purple-400 to-pink-300"
      default: return "from-slate-400 to-slate-500"
    }
  }

  const getTemperatureGradient = (status: string) => {
    switch (status) {
      case "hot": return "bg-rose-500/20"
      case "warm": return "bg-pink-500/20"
      case "cool": return "bg-purple-500/20"
      default: return "bg-slate-500/20"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return Smile
      case "negative": return Frown
      default: return Meh
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

  const SentimentIcon = getSentimentIcon(teamSentiment.overall)

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1">
        <main className="flex flex-col gap-6 p-5 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/30">
                <Heart className="h-7 w-7 text-rose-500" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Culture Engine</h2>
                <p className="text-sm text-muted-foreground">Team sentiment & workplace wellness</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 border-rose-300 text-rose-600 bg-rose-50">
                <Activity className="h-3 w-3" />
                Live
              </Badge>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Hero Section - Culture Temperature */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/50">
            <div className="absolute inset-0 bg-rose-500/5" />
            
            <div className="relative grid gap-8 p-8 md:grid-cols-2 lg:gap-12">
              {/* Temperature Gauge */}
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-3xl" />
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-slate-700 bg-slate-900/80 shadow-2xl">
                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-bold tracking-tight text-white font-mono">
                        {cultureTemperature.value.toFixed(0)}°
                      </span>
                      <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                        Temperature
                      </span>
                    </div>
                  </div>
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-medium text-white ${getTemperatureColor(cultureTemperature.status)}`}>
                    {cultureTemperature.status.charAt(0).toUpperCase() + cultureTemperature.status.slice(1)}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-rose-400" />
                  <span className="text-sm font-medium text-rose-400">{cultureTemperature.message}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col justify-center gap-4">
                <div className="flex flex-col gap-4">
                  {/* Team Sentiment */}
                  <div className="group relative overflow-hidden rounded-xl bg-rose-950/30 p-4 border border-rose-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-rose-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20">
                          <SentimentIcon className="h-5 w-5 text-rose-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-rose-400">Team Sentiment</p>
                          <p className="text-xs text-rose-500/60">Overall mood analysis</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-rose-400 capitalize">{teamSentiment.overall}</p>
                        <p className="text-xs text-rose-500/60">Score: {teamSentiment.score.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Active Members */}
                  <div className="group relative overflow-hidden rounded-xl bg-pink-950/30 p-4 border border-pink-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-pink-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20">
                          <Users className="h-5 w-5 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-pink-400">Active Members</p>
                          <p className="text-xs text-pink-500/60">Team size</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-pink-400">{users.length || 24}</p>
                        <p className="text-xs text-pink-500/60">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Highlights */}
                  <div className="group relative overflow-hidden rounded-xl bg-fuchsia-950/30 p-4 border border-fuchsia-900/30">
                    <div className="absolute right-0 top-0 h-full w-24 bg-fuchsia-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/20">
                          <Sparkles className="h-5 w-5 text-fuchsia-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-fuchsia-400">Recent Highlights</p>
                          <p className="text-xs text-fuchsia-500/60">Latest team moments</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-fuchsia-400">{recentMoodHighlights.length}</p>
                        <p className="text-xs text-fuchsia-500/60">This week</p>
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
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "trends"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Trends
            </button>
            <button
              onClick={() => setActiveTab("balance")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "balance"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="h-4 w-4" />
              Work-Life Balance
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Sentiment Breakdown */}
              <div className="lg:col-span-2">
                <Card className="h-full border-rose-200/50 bg-rose-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-rose-500" />
                      Sentiment Breakdown
                    </CardTitle>
                    <CardDescription>Detailed analysis of team mood</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Overall Score Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Overall Score</span>
                          <span className="text-rose-600 font-bold">{teamSentiment.score.toFixed(0)}/100</span>
                        </div>
                        <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full transition-all duration-500"
                            style={{ width: `${teamSentiment.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Sentiment Distribution */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center p-4 rounded-xl bg-green-50 border border-green-200">
                          <Smile className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="text-2xl font-bold text-green-600">{teamSentiment.breakdown.positive.toFixed(0)}%</p>
                          <p className="text-xs text-green-600/70">Positive</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                          <Meh className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                          <p className="text-2xl font-bold text-yellow-600">{teamSentiment.breakdown.neutral.toFixed(0)}%</p>
                          <p className="text-xs text-yellow-600/70">Neutral</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-red-50 border border-red-200">
                          <Frown className="h-8 w-8 mx-auto mb-2 text-red-500" />
                          <p className="text-2xl font-bold text-red-600">{teamSentiment.breakdown.negative.toFixed(0)}%</p>
                          <p className="text-xs text-red-600/70">Negative</p>
                        </div>
                      </div>

                      {/* Recent Highlights */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Recent Highlights</h4>
                        <div className="space-y-2">
                          {recentMoodHighlights.map((highlight, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a2e] border border-rose-900/30"
                            >
                              <span className="text-xl">{highlight.emoji}</span>
                              <span className="text-sm text-foreground flex-1">{highlight.text}</span>
                              <Badge 
                                variant="secondary" 
                                className={
                                  highlight.type === "positive" ? "bg-green-100 text-green-700" :
                                  highlight.type === "negative" ? "bg-red-100 text-red-700" :
                                  "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {highlight.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Culture Metrics */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-400" />
                  <h3 className="text-lg font-semibold text-foreground">Culture Metrics</h3>
                </div>

                <div className="space-y-3">
                  {collaborationTrends.map((metric) => (
                    <Card key={metric.label} className="border-rose-100/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <metric.icon className="h-4 w-4 text-rose-500" />
                            <span className="text-sm font-medium">{metric.label}</span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(metric.change).toFixed(1)}%
                          </div>
                        </div>
                        <Progress value={metric.value} className="h-2 bg-rose-100" />
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-muted-foreground">Score</span>
                          <span className="text-xs font-medium text-rose-600">{metric.value.toFixed(0)}/100</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mood Over Time Chart */}
          {activeTab === "overview" && (
            <Card className="border-rose-200/50 bg-rose-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-rose-500" />
                  Team Mood Over Time
                </CardTitle>
                <CardDescription>30-day mood trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-48">
                  {/* Chart bars */}
                  <div className="flex items-end justify-between h-32 gap-1">
                    {moodOverTime.map((data, idx) => (
                      <div 
                        key={idx}
                        className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer group relative"
                        style={{ 
                          height: `${data.score}%`,
                          backgroundColor: data.score > 70 ? '#22c55e' : data.score > 40 ? '#eab308' : '#ef4444'
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {data.date}: {data.score.toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* X-axis labels */}
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>30 days ago</span>
                    <span>15 days ago</span>
                    <span>Today</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-rose-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">Positive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-xs text-muted-foreground">Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs text-muted-foreground">Negative</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trends Tab */}
          {activeTab === "trends" && (
            <div className="space-y-6">
              <Card className="border-rose-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-rose-500" />
                    Collaboration Trends
                  </CardTitle>
                  <CardDescription>Track how your team works together</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {collaborationTrends.map((metric) => (
                      <div 
                        key={metric.label}
                        className="relative overflow-hidden rounded-xl border border-rose-100 p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/50 rounded-bl-full" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
                              <metric.icon className="h-5 w-5 text-rose-500" />
                            </div>
                            <div>
                              <p className="font-medium">{metric.label}</p>
                              <p className="text-xs text-muted-foreground">Last 30 days</p>
                            </div>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-3xl font-bold text-rose-600">{metric.value.toFixed(0)}</p>
                              <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              metric.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {metric.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {Math.abs(metric.change).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trend Details */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-rose-200/50">
                  <CardHeader>
                    <CardTitle className="text-base">Top Collaborators</CardTitle>
                    <CardDescription>Most active team connectors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Sarah Chen", collaborations: 156, avatar: "SC" },
                        { name: "Mike Johnson", collaborations: 142, avatar: "MJ" },
                        { name: "Emily Davis", collaborations: 128, avatar: "ED" },
                        { name: "Alex Kim", collaborations: 115, avatar: "AK" },
                        { name: "Jordan Lee", collaborations: 98, avatar: "JL" }
                      ].map((person, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50 transition-colors">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-xs">
                            {idx + 1}
                          </div>
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-rose-100 text-rose-600 text-xs">
                              {person.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{person.name}</p>
                          </div>
                          <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                            {person.collaborations}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-rose-200/50">
                  <CardHeader>
                    <CardTitle className="text-base">Team Bonding Events</CardTitle>
                    <CardDescription>Recent & upcoming activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { event: "Team Lunch", date: "Yesterday", type: "completed", icon: "🍕" },
                        { event: "Game Night", date: "This Friday", type: "upcoming", icon: "🎮" },
                        { event: "Team Retreat", date: "Next Month", type: "planning", icon: "🏖️" },
                        { event: "Coffee Chat", date: "Every Friday", type: "recurring", icon: "☕" },
                        { event: "Show & Tell", date: "Bi-weekly", type: "recurring", icon: "📊" }
                      ].map((event, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-rose-100">
                          <span className="text-2xl">{event.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{event.event}</p>
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={
                              event.type === "completed" ? "bg-green-100 text-green-700" :
                              event.type === "upcoming" ? "bg-blue-100 text-blue-700" :
                              "bg-purple-100 text-purple-700"
                            }
                          >
                            {event.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Work-Life Balance Tab */}
          {activeTab === "balance" && (
            <div className="space-y-6">
              <Card className="border-rose-200/50 bg-rose-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-rose-500" />
                    Work-Life Balance Metrics
                  </CardTitle>
                  <CardDescription>Monitor team wellness and burnout indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {workLifeBalance.map((metric) => (
                      <div 
                        key={metric.label}
                        className="text-center p-4 rounded-xl bg-[#1a1a2e] border border-rose-900/30"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-900/30 mx-auto mb-3">
                          <metric.icon className="h-5 w-5 text-rose-500" />
                        </div>
                        <p className="text-2xl font-bold text-rose-400">{metric.value.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground mb-2">{metric.label}</p>
                        <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          metric.label === "After-hours Activity" || metric.label === "Meeting Load"
                            ? (metric.change > 0 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400')
                            : (metric.change >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400')
                        }`}>
                          {metric.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(metric.change).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Balance Tips */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-rose-200/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4 text-rose-500" />
                      Wellness Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { title: "Take Regular Breaks", desc: "Short breaks improve focus and reduce stress", icon: "☕" },
                        { title: "Set Clear Boundaries", desc: "Define work hours and stick to them", icon: "⏰" },
                        { title: "Use PTO Days", desc: "Taking time off prevents burnout", icon: "🏖️" },
                        { title: "Limit After-Hours", desc: "Avoid checking emails after work", icon: "🌙" },
                        { title: "Stay Active", desc: "Regular exercise boosts energy", icon: "🏃" }
                      ].map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-rose-50 transition-colors">
                          <span className="text-xl">{tip.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{tip.title}</p>
                            <p className="text-xs text-muted-foreground">{tip.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-rose-200/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sun className="h-4 w-4 text-pink-500" />
                      Team Energy Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { time: "Morning (9AM-12PM)", energy: 85, label: "Peak Productivity" },
                        { time: "Afternoon (12PM-3PM)", energy: 70, label: "Post-Lunch Dip" },
                        { time: "Late Afternoon (3PM-6PM)", energy: 75, label: "Secondary Peak" },
                        { time: "Evening (6PM+)", energy: 25, label: "Wind Down" }
                      ].map((period, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{period.time}</span>
                            <span className="text-xs text-muted-foreground">{period.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-rose-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${period.energy}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-rose-600 w-8">{period.energy}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Work Hours Distribution */}
              <Card className="border-rose-200/50">
                <CardHeader>
                  <CardTitle className="text-base">Weekly Work Hours Distribution</CardTitle>
                  <CardDescription>How many hours team members are working</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { range: "< 35 hours", count: 3, color: "bg-green-500" },
                      { range: "35-40 hours", count: 12, color: "bg-rose-500" },
                      { range: "40-45 hours", count: 6, color: "bg-yellow-500" },
                      { range: "45-50 hours", count: 2, color: "bg-orange-500" },
                      { range: "> 50 hours", count: 1, color: "bg-red-500" }
                    ].map((group, idx) => {
                      const percentage = (group.count / 24) * 100
                      return (
                        <div key={idx} className="flex items-center gap-4">
                          <span className="w-24 text-sm text-muted-foreground">{group.range}</span>
                          <div className="flex-1 h-6 bg-rose-50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${group.color} rounded-full flex items-center justify-end pr-2`}
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-xs text-white font-medium">{group.count}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
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

export default function CultureEnginePage() {
  return (
    <ProtectedRoute>
      <CultureContent />
    </ProtectedRoute>
  )
}
