"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Shield, Cpu, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface SystemHealth {
  database?: {
    total_users: number
    total_events: number
  }
  risk_summary?: {
    critical_count: number
    elevated_count: number
    at_risk_total: number
  }
  activity_24h?: {
    events: number
    audit_logs: number
  }
}

export function GlobalStatsCards() {
  const { session, loading: authLoading } = useAuth()
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (authLoading || !session) return
    api.get<SystemHealth>("/admin/health")
      .then(data => setHealth(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [authLoading, session])

  const totalUsers = health?.database?.total_users ?? null
  const criticalCount = health?.risk_summary?.critical_count ?? null
  const atRiskTotal = health?.risk_summary?.at_risk_total ?? null

  // Org health = (users not at risk) / total, as a percentage
  const orgHealth = totalUsers && atRiskTotal != null
    ? Math.round(((totalUsers - atRiskTotal) / Math.max(totalUsers, 1)) * 100)
    : null

  // Derive active engine count from recent activity.
  // TODO: Replace with a dedicated GET /admin/engine-status endpoint that returns
  //       per-engine health (Safety Valve, Talent Scout, Culture Thermometer, Network).
  //       For now, we report "active" only when the system has processed events recently.
  const TOTAL_ENGINES = 4
  const enginesActive = health?.activity_24h != null
    ? (health.activity_24h.events > 0 ? TOTAL_ENGINES : 0)
    : null

  const isLoading = authLoading || loading

  const Skeleton = () => (
    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-background shadow-lg" style={{borderColor: 'hsl(var(--sentinel-healthy) / 0.2)', boxShadow: '0 4px 6px -1px hsl(var(--sentinel-healthy) / 0.05)'}}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{color: 'hsl(var(--sentinel-healthy))'}}>Total Org Health</CardTitle>
          <Activity className="h-4 w-4" style={{color: 'hsl(var(--sentinel-healthy))'}} />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton /> : (
            <div className="text-2xl font-bold text-foreground">
              {orgHealth != null ? `${orgHealth}%` : "--"}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {error ? "Failed to load" : isLoading ? "Loading..." : atRiskTotal != null ? `${atRiskTotal} at-risk member${atRiskTotal !== 1 ? "s" : ""}` : "..."}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-background shadow-lg" style={{borderColor: 'hsl(var(--primary) / 0.2)', boxShadow: '0 4px 6px -1px hsl(var(--primary) / 0.05)'}}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{color: 'hsl(var(--primary))'}}>Active Engines</CardTitle>
          <RefreshCw className="h-4 w-4 animate-spin-slow" style={{color: 'hsl(var(--primary))'}} />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton /> : (
            <div className="text-2xl font-bold text-foreground">
              {enginesActive != null ? `${enginesActive}/${TOTAL_ENGINES}` : "--"}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {error ? "Failed to load" : isLoading ? "Loading..." : enginesActive != null ? (enginesActive === TOTAL_ENGINES ? "Running optimally" : `${TOTAL_ENGINES - enginesActive} engine(s) idle`) : "..."}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-background shadow-lg" style={{borderColor: 'hsl(var(--sentinel-elevated) / 0.2)', boxShadow: '0 4px 6px -1px hsl(var(--sentinel-elevated) / 0.05)'}}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{color: 'hsl(var(--sentinel-elevated))'}}>Critical Members</CardTitle>
          <Cpu className="h-4 w-4" style={{color: 'hsl(var(--sentinel-elevated))'}} />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton /> : (
            <div className="text-2xl font-bold text-foreground">
              {criticalCount != null ? criticalCount : "--"}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            High-risk employees
          </p>
        </CardContent>
      </Card>

      <Card className="bg-background shadow-lg" style={{borderColor: 'hsl(var(--sentinel-info) / 0.2)', boxShadow: '0 4px 6px -1px hsl(var(--sentinel-info) / 0.05)'}}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{color: 'hsl(var(--sentinel-info))'}}>Active Users</CardTitle>
          <Shield className="h-4 w-4" style={{color: 'hsl(var(--sentinel-info))'}} />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton /> : (
            <div className="text-2xl font-bold text-foreground">
              {totalUsers != null ? totalUsers : "--"}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Total enrolled
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
