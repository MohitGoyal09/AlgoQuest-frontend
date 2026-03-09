"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Bell,
  Brain,
  CheckCircle2,
  Heart,
  Shield,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "critical" | "warning" | "info" | "success"
  title: string
  message: string
  timestamp: string
  read: boolean
  engine?: string
}

// Demo notifications that showcase all three engines
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "critical",
    title: "Burnout Risk Escalated",
    message: "Employee a7f3b2c1 moved from ELEVATED → CRITICAL. After-hours commits increased 340% this week.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    engine: "Safety Valve",
  },
  {
    id: "n2",
    type: "success",
    title: "Hidden Gem Identified",
    message: "Talent Scout detected high betweenness centrality for user 9c2d1e4f — unblocking 4 teammates daily.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    engine: "Talent Scout",
  },
  {
    id: "n3",
    type: "warning",
    title: "Contagion Risk Detected",
    message: "Negative sentiment spreading in #backend-team. 3 members show declining communication patterns.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: false,
    engine: "Culture Thermometer",
  },
  {
    id: "n4",
    type: "info",
    title: "Nudge Delivered",
    message: "Manager nudge sent for a7f3b2c1: 'Schedule 1:1 check-in — employee showing isolation signals.'",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: true,
    engine: "Safety Valve",
  },
  {
    id: "n5",
    type: "success",
    title: "Intervention Impact",
    message: "After manager 1:1, user b3e9a1d2 risk dropped from ELEVATED → LOW within 5 days.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: true,
    engine: "Safety Valve",
  },
  {
    id: "n6",
    type: "warning",
    title: "Weekend Work Detected",
    message: "2 team members logged commits on Saturday. Pattern repeating for 3 consecutive weekends.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    read: true,
    engine: "Safety Valve",
  },
  {
    id: "n7",
    type: "info",
    title: "Data Pipeline Healthy",
    message: "All connectors operational. 247 events/hr processed. Avg latency 11ms.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    engine: "System",
  },
]

const typeConfig = {
  critical: {
    icon: AlertTriangle,
    bg: "bg-red-500/10",
    border: "border-l-red-500",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    border: "border-l-amber-500",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-400",
  },
  info: {
    icon: Brain,
    bg: "bg-blue-500/10",
    border: "border-l-blue-500",
    text: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-400",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-500/10",
    border: "border-l-emerald-500",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-400",
  },
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="sr-only">Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-background">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-12 z-50 w-96 rounded-xl border border-border bg-popover shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Notification list */}
            <ScrollArea className="h-[420px]">
              <div className="p-2 space-y-1">
                {notifications.map((notif) => {
                  const config = typeConfig[notif.type]
                  const Icon = config.icon
                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        "rounded-lg border-l-2 p-3 transition-colors cursor-pointer",
                        config.border,
                        notif.read
                          ? "bg-transparent hover:bg-muted/50"
                          : "bg-muted/30 hover:bg-muted/50"
                      )}
                      onClick={() =>
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                        )
                      }
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn("mt-0.5 rounded-md p-1", config.bg)}>
                          <Icon className={cn("h-3.5 w-3.5", config.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn("text-xs font-semibold", notif.read ? "text-muted-foreground" : "text-foreground")}>
                              {notif.title}
                            </p>
                            {!notif.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {notif.engine && (
                              <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 border-0", config.badge)}>
                                {notif.engine}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground/60">{timeAgo(notif.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  )
}
