"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, UserPlus, FileEdit, Settings, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface AuditLog {
  id: number
  user_hash: string
  action: string
  details: any
  timestamp: string
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function classifyLog(action: string): "error" | "warning" | "success" | "info" {
  const lower = action.toLowerCase()
  if (lower.includes("fail") || lower.includes("error") || lower.includes("delete")) return "error"
  if (lower.includes("alert") || lower.includes("risk") || lower.includes("warn")) return "warning"
  if (lower.includes("creat") || lower.includes("add") || lower.includes("register")) return "success"
  return "info"
}

export function AuditLogFeed() {
  const { session, loading: authLoading } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (authLoading || !session) return
    api.get<AuditLog[]>("/admin/audit-logs?limit=5&days=7")
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [authLoading, session])

  return (
    <div className="bg-background border border-border rounded-xl p-4 h-[380px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4" style={{color: 'hsl(var(--sentinel-healthy))'}} />
          Live Audit Log
        </h3>
        <span className="text-xs text-muted-foreground animate-pulse">● Live</span>
      </div>

      <ScrollArea className="flex-1 pr-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Failed to load audit logs
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No audit logs found
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const type = classifyLog(log.action)
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-border hover:bg-white/10 transition-colors">
                  <div className={`mt-1 p-1.5 rounded-full ${
                    type === 'error' ? 'bg-[hsl(var(--sentinel-critical))]/20' :
                    type === 'warning' ? 'bg-[hsl(var(--sentinel-elevated))]/20' :
                    'bg-[hsl(var(--sentinel-healthy))]/20'
                  }`}
                  style={{
                    color: type === 'error' ? 'hsl(var(--sentinel-critical))' :
                      type === 'warning' ? 'hsl(var(--sentinel-elevated))' :
                      'hsl(var(--sentinel-healthy))'
                  }}>
                    {type === 'error' ? <AlertTriangle className="w-3 h-3" /> :
                     type === 'warning' ? <FileEdit className="w-3 h-3" /> :
                     <UserPlus className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      <span className="font-mono text-xs mr-2" style={{color: 'hsl(var(--sentinel-healthy))'}}>
                        [{log.action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}]
                      </span>
                      {log.user_hash.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeTime(log.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
