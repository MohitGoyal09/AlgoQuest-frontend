"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Shield, Clock, Filter, RefreshCw, Download,
  AlertTriangle, CheckCircle2, Eye, UserCog,
  FileText, Lock, ChevronLeft, ChevronRight,
  Search, Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ProtectedRoute } from "@/components/protected-route"
import { ExportReport } from "@/components/export-report"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface AuditEntry {
  id: number
  user_hash: string
  action: string
  details: Record<string, any>
  timestamp: string
}

const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string; bg: string }> = {
  data_access: { icon: Eye, color: "text-blue-500", label: "Data Access", bg: "bg-blue-500/10" },
  authentication: { icon: Lock, color: "text-green-500", label: "Authentication", bg: "bg-green-500/10" },
  consent_changed: { icon: CheckCircle2, color: "text-purple-500", label: "Consent Changed", bg: "bg-purple-500/10" },
  role_updated: { icon: UserCog, color: "text-amber-500", label: "Role Updated", bg: "bg-amber-500/10" },
  nudge_sent: { icon: Activity, color: "text-pink-500", label: "Nudge Sent", bg: "bg-pink-500/10" },
  nudge_dismissed: { icon: CheckCircle2, color: "text-slate-500", label: "Nudge Dismissed", bg: "bg-slate-500/10" },
  data_deleted: { icon: AlertTriangle, color: "text-red-500", label: "Data Deleted", bg: "bg-red-500/10" },
  manager_assigned: { icon: UserCog, color: "text-cyan-500", label: "Manager Assigned", bg: "bg-cyan-500/10" },
  profile_updated: { icon: FileText, color: "text-indigo-500", label: "Profile Updated", bg: "bg-indigo-500/10" },
  break_scheduled: { icon: Clock, color: "text-emerald-500", label: "Break Scheduled", bg: "bg-emerald-500/10" },
}

const getActionConfig = (action: string) =>
  ACTION_CONFIG[action] || { icon: Activity, color: "text-muted-foreground", label: action, bg: "bg-muted" }

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [daysFilter, setDaysFilter] = useState(7)
  const [actionFilter, setActionFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [offset, setOffset] = useState(0)
  const [stats, setStats] = useState({ total: 0, today: 0, critical: 0 })
  const limit = 50

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      let url = `/admin/audit-logs?limit=${limit}&offset=${offset}&days=${daysFilter}`
      if (actionFilter !== "all") url += `&action_type=${actionFilter}`
      if (searchQuery) url += `&user_hash=${searchQuery}`

      const res = await api.get<any>(url)
      const data = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.logs || []
      setLogs(data)

      // Compute stats from data
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayCount = data.filter((l: AuditEntry) => new Date(l.timestamp) >= todayStart).length
      const criticalCount = data.filter((l: AuditEntry) =>
        ["data_deleted", "role_updated"].includes(l.action)
      ).length
      setStats({ total: data.length, today: todayCount, critical: criticalCount })
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }, [offset, daysFilter, actionFilter, searchQuery])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const exportColumns = [
    { key: "timestamp", label: "Timestamp" },
    { key: "action", label: "Action" },
    { key: "user_hash", label: "User Hash" },
    { key: "details_str", label: "Details" },
  ]

  const exportData = logs.map((l) => ({
    ...l,
    timestamp: new Date(l.timestamp).toLocaleString(),
    details_str: JSON.stringify(l.details || {}),
  }))

  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Shield className="h-5 w-5 text-amber-500" />
              </div>
              Audit Log
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Immutable record of all system actions — Vault B (Identity Schema)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportReport title="Sentinel Audit Log" columns={exportColumns} data={exportData} />
            <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total entries ({daysFilter}d)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-green-500/10">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-xs text-muted-foreground">Today&apos;s entries</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Sensitive actions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <div className="flex gap-1">
                {[1, 7, 30, 90].map((d) => (
                  <Button
                    key={d}
                    variant={daysFilter === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setDaysFilter(d); setOffset(0) }}
                    className="text-xs h-7"
                  >
                    {d}d
                  </Button>
                ))}
              </div>
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setOffset(0) }}
                className="h-7 rounded-md border bg-background px-2 text-xs"
              >
                <option value="all">All Actions</option>
                {Object.keys(ACTION_CONFIG).map((a) => (
                  <option key={a} value={a}>{ACTION_CONFIG[a].label}</option>
                ))}
              </select>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by user hash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-7 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity Timeline</CardTitle>
            <CardDescription>Showing {logs.length} entries</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No audit entries found for the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((entry, i) => {
                  const config = getActionConfig(entry.action)
                  const Icon = config.icon
                  const isSensitive = ["data_deleted", "role_updated"].includes(entry.action)
                  return (
                    <div
                      key={entry.id || i}
                      className={cn(
                        "flex items-start gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50",
                        isSensitive && "border-l-2 border-red-500/50"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg shrink-0 mt-0.5", config.bg)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {config.label}
                          </Badge>
                          {isSensitive && (
                            <Badge variant="destructive" className="text-[10px]">
                              Sensitive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1 text-foreground">
                          <span className="font-mono text-xs text-muted-foreground">
                            {entry.user_hash?.slice(0, 12)}...
                          </span>
                        </p>
                        {entry.details && Object.keys(entry.details).length > 0 && (
                          <div className="mt-1.5 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5 font-mono">
                            {Object.entries(entry.details).map(([k, v]) => (
                              <div key={k}>
                                <span className="text-muted-foreground/70">{k}:</span>{" "}
                                <span>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0 text-right">
                        <div>{formatTimeAgo(entry.timestamp)}</div>
                        <div className="mt-0.5 opacity-70">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {logs.length > 0 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {offset + 1}–{offset + logs.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    className="gap-1 h-7 text-xs"
                  >
                    <ChevronLeft className="h-3 w-3" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logs.length < limit}
                    onClick={() => setOffset(offset + limit)}
                    className="gap-1 h-7 text-xs"
                  >
                    Next <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
