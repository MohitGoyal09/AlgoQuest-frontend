"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"
import { SimulationPanel } from "@/components/simulation-panel"
import { VaultStatus } from "@/components/vault-status"
import { useSimulation } from "@/hooks/useSimulation"
import { useRecentEvents } from "@/hooks/useRecentEvents"
import { useUsers } from "@/hooks/useUsers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Terminal, Cpu, Database, Play, ChevronDown } from "lucide-react"

export default function SimulationPage() {
  const { injectEvent, createPersona } = useSimulation()
  const { events: recentEvents, refetch: refetchEvents } = useRecentEvents()
  const { users } = useUsers()
  const [activeUserHash, setActiveUserHash] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("sim_activeUserHash")
    }
    return null
  })
  const [activePersona, setActivePersona] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("sim_activePersona")
    }
    return null
  })
  const [isSimulationLoading, setIsSimulationLoading] = useState(false)
  const [showEventLog, setShowEventLog] = useState(false)

  useEffect(() => {
    if (activeUserHash) sessionStorage.setItem("sim_activeUserHash", activeUserHash)
    if (activePersona) sessionStorage.setItem("sim_activePersona", activePersona)
  }, [activeUserHash, activePersona])

  const handleSimulationInject = useCallback(async (eventType: string) => {
    const targetHash = activeUserHash || (users.length > 0 ? users[0].user_hash : null)
    if (!targetHash) {
      toast.error("No target user available. Create a digital twin first.")
      return
    }
    try {
      await injectEvent(targetHash, eventType)
      toast.success(`Event injected: ${eventType}`, {
        description: `Target: ${activePersona || targetHash.slice(0, 8) + "..."}`
      })
      setTimeout(() => refetchEvents(), 1000)
    } catch (e) {
      toast.error("Event injection failed. Check API connection.")
    }
  }, [activeUserHash, activePersona, users, injectEvent, refetchEvents])

  const handleCreatePersona = useCallback(async (personaId: string) => {
    setIsSimulationLoading(true)
    try {
      const email = `${personaId.split('_')[0]}@simulation.com`
      const result = await createPersona(email, personaId as any)
      if (result?.user_hash) {
        setActiveUserHash(result.user_hash)
        setActivePersona(personaId)
      }
      toast.success(`Digital twin created: ${personaId.split('_')[0]}`, {
        description: `${result?.events_created || 30} behavioral events generated`
      })
      setTimeout(() => refetchEvents(), 1500)
    } catch (e) {
      toast.error("Failed to create digital twin. Check API connection.")
    } finally {
      setIsSimulationLoading(false)
    }
  }, [createPersona, refetchEvents])

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex flex-col min-h-screen bg-background p-6 lg:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Cpu className="h-6 w-6 text-purple-500" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Simulation Mode</h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Digital Twin Generator & Event Injection. Use this environment to test engine responses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 space-y-6">
             <Card className="border-purple-500/20 shadow-lg shadow-purple-500/5">
                <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-foreground">
                      <Terminal className="h-5 w-5" />
                      Event Injection Terminal
                   </CardTitle>
                   <CardDescription>Manually trigger behavioural events for digital twins.</CardDescription>
                </CardHeader>
                <CardContent>
                   <SimulationPanel
                     onInjectEvent={handleSimulationInject}
                     onRunSimulation={handleCreatePersona}
                     activePersona={activePersona ?? undefined}
                     isLoading={isSimulationLoading}
                   />
                </CardContent>
             </Card>
          </div>

          {/* Sidebar Status */}
          <div className="space-y-6">
             <VaultStatus eventCount={recentEvents.length} userCount={users.length} />

             <Card>
                <CardHeader className="pb-0">
                   <button
                     type="button"
                     onClick={() => setShowEventLog(!showEventLog)}
                     className="flex items-center justify-between w-full"
                   >
                     <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Recent Event Log
                        <span className="text-[10px] text-muted-foreground font-normal">({recentEvents.length})</span>
                     </CardTitle>
                     <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showEventLog && "rotate-180")} />
                   </button>
                </CardHeader>
                {showEventLog && (
                  <CardContent className="pt-3">
                     <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
                        {recentEvents.slice(0, 10).map((e, i) => (
                           <div key={i} className="flex gap-2 text-muted-foreground">
                              <span className="text-purple-400">[{new Date(e.timestamp).toLocaleTimeString()}]</span>
                              <span>{e.event_type}</span>
                           </div>
                        ))}
                     </div>
                  </CardContent>
                )}
             </Card>
          </div>
        </div>

        {/* ── Live Engine Results (full-width, below the grid) ── */}
        {(() => {
          const targetUser = activeUserHash ? users.find(u => u.user_hash === activeUserHash) : null
          const personaLabel = activePersona ? activePersona.split('_')[0].charAt(0).toUpperCase() + activePersona.split('_')[0].slice(1) : null

          return (
            <Card className={cn(
              "border transition-all duration-300",
              targetUser
                ? targetUser.risk_level === "CRITICAL"
                  ? "border-red-500/30 bg-red-500/5"
                  : targetUser.risk_level === "ELEVATED"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-emerald-500/30 bg-emerald-500/5"
                : "border-border"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Play className="h-5 w-5 text-emerald-400" />
                    Engine Results
                  </CardTitle>
                  {personaLabel && (
                    <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 bg-purple-500/10">
                      Twin: {personaLabel}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {targetUser ? (
                  <div className="space-y-4">
                    {/* Metric cards row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="rounded-lg border border-border bg-card p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Risk Level</p>
                        <Badge variant="outline" className={cn(
                          "text-sm font-bold",
                          targetUser.risk_level === "CRITICAL" ? "border-red-500/30 text-red-400 bg-red-500/10" :
                          targetUser.risk_level === "ELEVATED" ? "border-amber-500/30 text-amber-400 bg-amber-500/10" :
                          "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        )}>
                          {targetUser.risk_level || "COMPUTING..."}
                        </Badge>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Velocity</p>
                        <p className="text-xl font-bold font-mono text-foreground">{targetUser.velocity?.toFixed(2) ?? "..."}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Confidence</p>
                        <p className="text-xl font-bold font-mono text-foreground">
                          {targetUser.confidence ? `${Math.round(targetUser.confidence * 100)}%` : "..."}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">User Hash</p>
                        <p className="text-xs font-mono text-muted-foreground truncate" title={activeUserHash ?? ""}>
                          {activeUserHash?.slice(0, 12)}...
                        </p>
                      </div>
                    </div>

                    {/* Navigation links */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a href="/engines/safety" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm text-foreground">
                        <span className="h-2 w-2 rounded-full bg-red-400" />
                        Safety Valve
                      </a>
                      <a href="/engines/talent" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm text-foreground">
                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                        Talent Scout
                      </a>
                      <a href="/team-health" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm text-foreground">
                        <span className="h-2 w-2 rounded-full bg-purple-400" />
                        Team Health
                      </a>
                      <a href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm text-foreground">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Dashboard
                      </a>
                    </div>
                  </div>
                ) : activePersona ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="h-5 w-5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Computing engine results for {personaLabel}... this takes a few seconds.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Select a persona above and click "Run Simulation" to see live engine results here.
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })()}

      </div>
    </ProtectedRoute>
  )
}
