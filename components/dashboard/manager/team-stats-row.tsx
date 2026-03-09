"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, AlertTriangle, Users, Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface TeamStatsProps {
  metrics: {
    total_members: number
    critical_count: number
    avg_velocity: number
    burnout_risk: number // 0-100
  } | null
}

export function TeamStatsRow({ metrics }: TeamStatsProps) {
  // Guard against null/undefined metrics
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-background border-white/5">
            <CardContent className="pt-6">
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-4"></div>
              <div className="h-8 w-16 bg-white/10 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-background border-white/5 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Users className="w-12 h-12 text-teal-500" />
        </div>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-muted-foreground">Team Size</div>
          <div className="text-3xl font-bold text-foreground mt-2">{metrics.total_members}</div>
          <p className="text-xs text-teal-400 mt-1 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
             All Active
          </p>
        </CardContent>
      </Card>

      <Card className="bg-background border-white/5 shadow-lg group">
        <CardContent className="pt-6">
           <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Burnout Risk</div>
                <div className="text-3xl font-bold text-foreground mt-2">{metrics.burnout_risk}%</div>
              </div>
              <div className={`p-2 rounded-lg ${metrics.burnout_risk > 50 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                 <AlertTriangle className="w-5 h-5" />
              </div>
           </div>
           <Progress value={metrics.burnout_risk} className={`h-1 mt-4 bg-slate-800 [&>div]:${metrics.burnout_risk > 50 ? 'bg-red-500' : 'bg-green-500'}`} />
        </CardContent>
      </Card>

      <Card className="bg-background border-white/5 shadow-lg group">
        <CardContent className="pt-6">
           <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Avg Velocity</div>
                <div className="text-3xl font-bold text-foreground mt-2">{metrics.avg_velocity.toFixed(1)}</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                 <TrendingUp className="w-5 h-5" />
              </div>
           </div>
           <p className="text-xs text-muted-foreground mt-4">
             Story points / sprint
           </p>
        </CardContent>
      </Card>

      <Card className="bg-background border-white/5 shadow-lg group">
        <CardContent className="pt-6">
           <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Skill Gaps</div>
                <div className="text-3xl font-bold text-foreground mt-2">2</div>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                 <Target className="w-5 h-5" />
              </div>
           </div>
           <p className="text-xs text-purple-400 mt-4 cursor-pointer hover:underline">
             View recommended training →
           </p>
        </CardContent>
      </Card>
    </div>
  )
}
