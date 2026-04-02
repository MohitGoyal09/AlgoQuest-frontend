"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface DayData {
  date: string
  risk_level: "LOW" | "ELEVATED" | "CRITICAL"
  avg_velocity: number
  breakdown: {
    low: number
    elevated: number
    critical: number
  }
  total_members: number
}

interface HeatmapResponse {
  days: DayData[]
  date_range: {
    start: string
    end: string
  }
}

export function TeamEnergyHeatmap() {
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<HeatmapResponse>('/analytics/team-energy-heatmap?days=30')
        setData(response.days || [])
      } catch (error) {
        console.error('Failed to load heatmap:', error)
        setError('Failed to load heatmap data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const weeks = useMemo(() => {
    // Group days into weeks (7 days per row)
    const grouped: DayData[][] = []
    for (let i = 0; i < data.length; i += 7) {
      grouped.push(data.slice(i, i + 7))
    }
    return grouped
  }, [data])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/80 border-red-400 hover:bg-red-500'
      case 'ELEVATED':
        return 'bg-amber-500/80 border-amber-400 hover:bg-amber-500'
      default:
        return 'bg-emerald-500/80 border-emerald-400 hover:bg-emerald-500'
    }
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Team Energy Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading heatmap...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Team Energy Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">
            {error || 'No data available yet. Start collecting team wellness data.'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Team Energy Heatmap
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Last 30 days of team wellness patterns
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
              <span className="text-muted-foreground">Healthy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/80" />
              <span className="text-muted-foreground">Elevated</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-500/80" />
              <span className="text-muted-foreground">Critical</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex gap-1.5">
              {week.map((day, dayIdx) => (
                <TooltipProvider key={dayIdx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex-1 h-12 rounded border-2 cursor-pointer transition-all hover:scale-105",
                          getRiskColor(day.risk_level)
                        )}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="p-3 max-w-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {day.risk_level}
                          </Badge>
                        </div>
                        <div className="text-[11px] space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Velocity:</span>
                            <span className="font-mono">{day.avg_velocity.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Healthy:</span>
                            <span className="font-mono text-emerald-400">{day.breakdown.low}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Elevated:</span>
                            <span className="font-mono text-amber-400">{day.breakdown.elevated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Critical:</span>
                            <span className="font-mono text-red-400">{day.breakdown.critical}</span>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ))}
        </div>

        {hoveredDay && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Selected Day</div>
            <div className="text-sm font-semibold mb-2">
              {new Date(hoveredDay.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Team Status:</span>
                <span className="ml-2 font-medium">{hoveredDay.risk_level}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Members:</span>
                <span className="ml-2 font-mono">{hoveredDay.total_members}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
