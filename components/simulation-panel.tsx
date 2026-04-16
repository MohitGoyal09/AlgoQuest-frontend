"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Beaker, Check, ChevronDown, Play, RotateCcw, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimulationPanelProps {
  onInjectEvent?: (eventType: string) => void
  onRunSimulation?: (persona: string) => void
  activePersona?: string
  isLoading?: boolean
}


const personas = [
  {
    id: "alex_burnout",
    label: "Alex (Burnout Pattern)",
    risk: "CRITICAL" as const,
    description: "Late nights escalating, social withdrawal, no recovery days",
  },
  {
    id: "sarah_gem",
    label: "Sarah (Hidden Gem)",
    risk: "LOW" as const,
    description: "Low visibility, high betweenness, bridges disconnected teams",
  },
  {
    id: "jordan_steady",
    label: "Jordan (Control)",
    risk: "LOW" as const,
    description: "Stable 9-6 pattern, flat velocity, consistent baseline",
  },
  {
    id: "maria_contagion",
    label: "Maria (Contagion)",
    risk: "ELEVATED" as const,
    description: "Team fragmentation, communication decay spreading",
  },
]

const injectionTypes = [
  { id: "late_commit", label: "Late Night Commit", icon: Zap, impact: "Increases velocity + entropy" },
  { id: "missed_standup", label: "Missed Standup", icon: AlertTriangle, impact: "Reduces connection index" },
  { id: "weekend_work", label: "Weekend Work", icon: Zap, impact: "Adds overwork indicator" },
  { id: "pr_review", label: "Helpful PR Review", icon: Beaker, impact: "Increases unblocking count" },
]

export function SimulationPanel({ onInjectEvent, onRunSimulation, activePersona, isLoading }: SimulationPanelProps) {
  const [selectedPersona, setSelectedPersona] = useState<string>("")
  const [injectionLog, setInjectionLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  const handleInject = (eventId: string) => {
    const now = new Date().toLocaleTimeString()
    setInjectionLog((prev) => [`[${now}] Injected: ${eventId}`, ...prev.slice(0, 9)])
    onInjectEvent?.(eventId)
  }

  const handleRunSimulation = () => {
    if (!selectedPersona) return
    onRunSimulation?.(selectedPersona)
    const persona = personas.find((p) => p.id === selectedPersona)
    const now = new Date().toLocaleTimeString()
    setInjectionLog((prev) =>
      [
        `[${now}] Simulation started: ${persona?.label}`,
        `[${now}] Generating 30 days of synthetic events...`,
        `[${now}] Running Safety Valve analysis...`,
        `[${now}] Computing network centrality...`,
        ...prev.slice(0, 5),
      ]
    )
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">Simulation Controls</CardTitle>
          <Badge variant="outline" className="border-[hsl(var(--sentinel-info))]/20 bg-[hsl(var(--sentinel-info))]/6 text-[10px] text-[hsl(var(--sentinel-info))]">
            <Beaker className="mr-1 h-2.5 w-2.5" />
            Demo Mode
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Persona Selector */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Create Digital Twin
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {personas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPersona(p.id)}
                className={cn(
                  "relative flex flex-col items-start gap-1.5 rounded-lg border px-4 py-3 text-left transition-all duration-150",
                  activePersona === p.id
                    ? "ring-2 ring-emerald-400 border-emerald-400/30 bg-emerald-500/5"
                    : selectedPersona === p.id
                      ? "ring-2 ring-primary border-primary/30 bg-primary/4 shadow-sm"
                      : "border-border bg-muted/30 hover:border-border hover:bg-muted/50"
                )}
              >
                {activePersona === p.id && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <div className="flex w-full items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      p.risk === "CRITICAL"
                        ? "bg-[hsl(var(--sentinel-critical))]"
                        : p.risk === "ELEVATED"
                          ? "bg-[hsl(var(--sentinel-elevated))]"
                          : "bg-[hsl(var(--sentinel-healthy))]"
                    )}
                  />
                  <span className="text-xs font-semibold text-foreground">{p.label}</span>
                  {activePersona === p.id && (
                    <Badge variant="outline" className="ml-auto border-emerald-500/30 bg-emerald-500/10 text-[9px] text-emerald-400">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{p.description}</p>
              </button>
            ))}
          </div>
          <Button
            onClick={handleRunSimulation}
            disabled={!selectedPersona || isLoading}
            className="mt-1 h-10 rounded-lg"
          >
            {isLoading ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Simulation
              </>
            )}
          </Button>
        </div>

        {/* Inject Events */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
            Inject Event (Real-Time)
          </p>
          {activePersona && (
            <div className="flex items-center gap-2 mb-1 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">
                Targeting: {activePersona.split('_')[0].charAt(0).toUpperCase() + activePersona.split('_')[0].slice(1)}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {injectionTypes.map((inj) => (
              <Button
                key={inj.id}
                variant="outline"
                size="sm"
                onClick={() => handleInject(inj.id)}
                className="flex h-auto flex-col items-start gap-1 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <inj.icon className="h-3.5 w-3.5 text-[hsl(var(--sentinel-info))]" />
                  <span className="text-xs font-semibold">{inj.label}</span>
                </div>
                <p className="text-[10px] font-normal text-muted-foreground">{inj.impact}</p>
              </Button>
            ))}
          </div>
        </div>

        {/* Log */}
        {injectionLog.length > 0 && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowLog(!showLog)}
              className="flex items-center justify-between w-full text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Activity Log ({injectionLog.length})</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showLog && "rotate-180")} />
            </button>
            {showLog && (
              <div className="max-h-36 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4">
                {injectionLog.map((log, i) => (
                  <p key={`log-${i}`} className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {log}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
