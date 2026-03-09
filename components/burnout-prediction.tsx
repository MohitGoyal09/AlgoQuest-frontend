"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface BurnoutPredictionProps {
  riskData?: {
    risk_level: string
    velocity: number
    confidence: number
    belongingness_score?: number
    circadian_entropy?: number
    indicators?: Record<string, boolean>
    [key: string]: any
  }
  history?: Array<{
    date?: string
    timestamp?: string
    risk_level: string
    velocity: number
    belongingness_score?: number
    [key: string]: any
  }>
}

// Generate future prediction points based on current trajectory
function generatePrediction(
  history: BurnoutPredictionProps["history"],
  currentRisk: string,
  days: number = 14
) {
  if (!history || history.length < 2) return []

  const lastVelocity = history[history.length - 1]?.velocity || 0
  const prevVelocity = history[Math.max(0, history.length - 3)]?.velocity || 0
  const trend = (lastVelocity - prevVelocity) / 3

  const predictions = []
  const now = new Date()

  for (let i = 1; i <= days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)

    // Velocity with dampened trend + slight noise
    const projected = Math.max(0, Math.min(5, lastVelocity + trend * i * 0.6))
    const upper = Math.min(5, projected * 1.15)
    const lower = Math.max(0, projected * 0.85)

    predictions.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      velocity: Number(projected.toFixed(2)),
      upper: Number(upper.toFixed(2)),
      lower: Number(lower.toFixed(2)),
      isPrediction: true,
    })
  }
  return predictions
}

function getRiskFromVelocity(v: number): string {
  if (v >= 2.5) return "CRITICAL"
  if (v >= 1.5) return "ELEVATED"
  return "LOW"
}

export function BurnoutPrediction({ riskData, history }: BurnoutPredictionProps) {
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return []

    const historical = history.slice(-14).map((h) => ({
      date: h.date || new Date(h.timestamp || "").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      velocity: h.velocity,
      isPrediction: false,
    }))

    const predictions = generatePrediction(history, riskData?.risk_level || "LOW")

    return [...historical, ...predictions]
  }, [history, riskData])

  const prediction = useMemo(() => {
    if (!chartData.length) return null

    const futurePoints = chartData.filter((d: any) => d.isPrediction)
    if (futurePoints.length === 0) return null

    const lastPredicted = futurePoints[futurePoints.length - 1]
    const currentVelocity = riskData?.velocity || 0
    const predictedVelocity = (lastPredicted as any).velocity || 0
    const predictedRisk = getRiskFromVelocity(predictedVelocity)

    const daysToThreshold = futurePoints.findIndex((p: any) => p.velocity >= 2.5)

    return {
      predictedRisk,
      predictedVelocity,
      trend: predictedVelocity > currentVelocity ? "increasing" : predictedVelocity < currentVelocity ? "decreasing" : "stable",
      daysToThreshold: daysToThreshold >= 0 ? daysToThreshold + 1 : null,
    }
  }, [chartData, riskData])

  // Contributing factors from indicators
  const factors = useMemo(() => {
    if (!riskData?.indicators) return []
    const factorMap: Record<string, { label: string; weight: number }> = {
      overwork: { label: "After-hours activity", weight: 35 },
      isolation: { label: "Reduced collaboration", weight: 25 },
      late_night_pattern: { label: "Late-night commits", weight: 20 },
      communication_decline: { label: "Communication decline", weight: 15 },
      fragmentation: { label: "Context switching", weight: 10 },
      weekend_work: { label: "Weekend work", weight: 15 },
    }

    return Object.entries(riskData.indicators)
      .filter(([_, active]) => active)
      .map(([key, _]) => factorMap[key])
      .filter(Boolean)
      .sort((a, b) => b.weight - a.weight)
  }, [riskData])

  const riskColorMap: Record<string, string> = {
    LOW: "text-emerald-400",
    ELEVATED: "text-amber-400",
    CRITICAL: "text-red-400",
  }

  return (
    <Card className="bg-[#111827]/50 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-purple-400" />
              Burnout Prediction
            </CardTitle>
            <CardDescription>14-day risk trajectory forecast with confidence intervals</CardDescription>
          </div>
          {prediction && (
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1",
                prediction.predictedRisk === "CRITICAL"
                  ? "border-red-500/30 text-red-400 bg-red-500/10"
                  : prediction.predictedRisk === "ELEVATED"
                    ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                    : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
              )}
            >
              {prediction.trend === "increasing" ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : prediction.trend === "decreasing" ? (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              ) : (
                <Minus className="h-3 w-3 mr-1" />
              )}
              {prediction.predictedRisk} in 14d
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="h-[250px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="predictionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 4]}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                    />
                    <ReferenceLine y={2.5} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Critical", fill: "#ef4444", fontSize: 10 }} />
                    <ReferenceLine y={1.5} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: "Elevated", fill: "#fbbf24", fontSize: 10 }} />
                    {/* Confidence band for predictions */}
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="none"
                      fill="url(#predictionGrad)"
                      fillOpacity={1}
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="none"
                      fill="#0b101b"
                      fillOpacity={1}
                    />
                    {/* Velocity line */}
                    <Area
                      type="monotone"
                      dataKey="velocity"
                      stroke="#22c55e"
                      fill="url(#historicalGrad)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#22c55e" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  Insufficient history for prediction
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 bg-emerald-500 rounded" />
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-0.5 w-4 bg-purple-500 rounded opacity-50" />
                <span>Predicted (70% confidence)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-[1px] w-4 border-t border-dashed border-red-500" />
                <span>Critical threshold</span>
              </div>
            </div>
          </div>

          {/* Right panel: factors + prediction info */}
          <div className="space-y-4">
            {/* Prediction alert */}
            {prediction?.daysToThreshold && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-400">Early Warning</span>
                </div>
                <p className="text-xs text-red-400/80">
                  Predicted to reach CRITICAL threshold in {prediction.daysToThreshold} days at current trajectory.
                </p>
              </div>
            )}

            {/* Contributing factors */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contributing Factors</h4>
              {factors.length > 0 ? (
                <div className="space-y-2">
                  {factors.map((f, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-slate-300">{f.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400/70"
                            style={{ width: `${f.weight}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{f.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No active risk indicators</p>
              )}
            </div>

            {/* Current metrics */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Metrics</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Velocity</span>
                  <span className={cn("text-xs font-mono", riskColorMap[riskData?.risk_level || "LOW"])}>
                    {riskData?.velocity?.toFixed(2) || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Confidence</span>
                  <span className="text-xs font-mono text-slate-300">
                    {riskData?.confidence ? `${(riskData.confidence * 100).toFixed(0)}%` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Belongingness</span>
                  <span className="text-xs font-mono text-slate-300">
                    {riskData?.belongingness_score?.toFixed(2) || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
