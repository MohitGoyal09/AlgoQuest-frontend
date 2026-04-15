"use client"

import { Clock, MessageSquare, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Employee } from "@/types"
import { cn } from "@/lib/utils"
import { riskTextColor } from "./user-selector"

interface RiskAssessmentProps {
  employee: Employee
}

export function RiskAssessment({ employee }: RiskAssessmentProps) {
  // Guard against undefined employee
  if (!employee) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No employee data available</p>
        </CardContent>
      </Card>
    )
  }

  const riskPercent =
    employee.risk_level === "CRITICAL"
      ? 90
      : employee.risk_level === "ELEVATED"
        ? 60
        : 25

  const strokeColor =
    employee.risk_level === "CRITICAL"
      ? "hsl(var(--sentinel-critical))"
      : employee.risk_level === "ELEVATED"
        ? "hsl(var(--sentinel-elevated))"
        : "hsl(var(--sentinel-healthy))"

  const badgeClasses =
    employee.risk_level === "CRITICAL"
      ? "bg-[hsl(var(--sentinel-critical))]/8 text-[hsl(var(--sentinel-critical))] border-[hsl(var(--sentinel-critical))]/15"
      : employee.risk_level === "ELEVATED"
        ? "bg-[hsl(var(--sentinel-elevated))]/8 text-[hsl(var(--sentinel-elevated))] border-[hsl(var(--sentinel-elevated))]/15"
        : "bg-[hsl(var(--sentinel-healthy))]/8 text-[hsl(var(--sentinel-healthy))] border-[hsl(var(--sentinel-healthy))]/15"

  const indicators = [
    { key: "chaotic_hours", label: "Chaotic Schedule", active: employee.indicators?.chaotic_hours || false },
    { key: "social_withdrawal", label: "Social Withdrawal", active: employee.indicators?.social_withdrawal || false },
    { key: "sustained_intensity", label: "Sustained High Intensity", active: employee.indicators?.sustained_intensity || false },
    { key: "has_explained_context", label: "Context Available", active: employee.indicators?.has_explained_context || false },
  ]

  const activeCount = indicators.filter((i) => i.active).length

  return (
    <Card className={cn("border-border bg-card shadow-sm", (employee as any).className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">Risk Assessment</CardTitle>
          <Badge variant="outline" className={cn("text-[10px] font-semibold", badgeClasses)}>
            {employee.risk_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Attrition Probability */}
        {employee.attrition_probability > 0 && (
          <div className={cn(
            "rounded-lg p-4 text-center border",
            employee.attrition_probability >= 0.6
              ? "bg-[hsl(var(--sentinel-critical))]/8 border-[hsl(var(--sentinel-critical))]/20"
              : employee.attrition_probability >= 0.3
                ? "bg-[hsl(var(--sentinel-elevated))]/8 border-[hsl(var(--sentinel-elevated))]/20"
                : "bg-[hsl(var(--sentinel-healthy))]/8 border-[hsl(var(--sentinel-healthy))]/20"
          )}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Attrition Probability (30-day)
            </p>
            <p className={cn(
              "text-3xl font-bold tabular-nums",
              employee.attrition_probability >= 0.6
                ? "text-[hsl(var(--sentinel-critical))]"
                : employee.attrition_probability >= 0.3
                  ? "text-[hsl(var(--sentinel-elevated))]"
                  : "text-[hsl(var(--sentinel-healthy))]"
            )}>
              {(employee.attrition_probability * 100).toFixed(0)}%
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {employee.attrition_probability >= 0.6
                ? "High resignation risk — immediate action recommended"
                : employee.attrition_probability >= 0.3
                  ? "Moderate risk — monitor and intervene"
                  : "Low risk — maintain current support"}
            </p>
          </div>
        )}

        {/* Gauge */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="60" cy="60" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke={strokeColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${riskPercent * 3.014} ${(100 - riskPercent) * 3.014}`}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-xl font-semibold tabular-nums", riskTextColor(employee.risk_level))}>
                {employee.velocity.toFixed(1)}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Velocity</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Confidence:{" "}
            <span className="font-semibold text-foreground">{(employee.confidence * 100).toFixed(0)}%</span>
          </p>
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>Connection Index</span>
              </div>
              <span
                className={cn(
                  "font-mono text-xs font-semibold",
                  employee.belongingness_score < 0.4
                    ? "text-[hsl(var(--sentinel-critical))]"
                    : employee.belongingness_score < 0.6
                      ? "text-[hsl(var(--sentinel-elevated))]"
                      : "text-[hsl(var(--sentinel-healthy))]"
                )}
              >
                {employee.belongingness_score.toFixed(2)}
              </span>
            </div>
            <Progress value={employee.belongingness_score * 100} className="h-2 bg-muted" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Circadian Entropy</span>
              </div>
              <span
                className={cn(
                  "font-mono text-xs font-semibold",
                  employee.circadian_entropy > 1.5
                    ? "text-[hsl(var(--sentinel-critical))]"
                    : employee.circadian_entropy > 0.8
                      ? "text-[hsl(var(--sentinel-elevated))]"
                      : "text-[hsl(var(--sentinel-healthy))]"
                )}
              >
                {employee.circadian_entropy.toFixed(2)}
              </span>
            </div>
            <Progress value={Math.min((employee.circadian_entropy / 2) * 100, 100)} className="h-2 bg-muted" />
          </div>

          {/* Sentiment */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Communication Tone</span>
              </div>
              {employee.sentiment_available && employee.sentiment_score != null ? (
                <span
                  className={cn(
                    "font-mono text-xs font-semibold",
                    employee.sentiment_score < -0.3
                      ? "text-[hsl(var(--sentinel-critical))]"
                      : employee.sentiment_score < 0.3
                        ? "text-[hsl(var(--sentinel-elevated))]"
                        : "text-[hsl(var(--sentinel-healthy))]"
                  )}
                >
                  {employee.sentiment_score < -0.3
                    ? "Negative"
                    : employee.sentiment_score < 0.3
                      ? "Neutral"
                      : "Positive"}
                </span>
              ) : (
                <span className="font-mono text-xs text-muted-foreground/50">N/A</span>
              )}
            </div>
            {employee.sentiment_available && employee.sentiment_score != null && (
              <Progress
                value={Math.round(((employee.sentiment_score + 1) / 2) * 100)}
                className="h-2 bg-muted"
              />
            )}
          </div>
        </div>

        {/* Indicators */}
        <div>
          <p className="mb-2.5 text-xs font-medium text-muted-foreground">
            Active Indicators ({activeCount}/{indicators.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {indicators.map((ind) => (
              <Badge
                key={ind.key}
                variant="outline"
                className={cn(
                  "py-1 text-[10px]",
                  ind.active
                    ? "border-[hsl(var(--sentinel-critical))]/20 bg-[hsl(var(--sentinel-critical))]/6 text-[hsl(var(--sentinel-critical))]"
                    : "border-border text-muted-foreground/50"
                )}
              >
                {ind.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
