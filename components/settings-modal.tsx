"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, Palette, Bell, Lock, Users2, Info } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface NotificationSettings {
  emailDigest: boolean
  riskAlerts: boolean
  teamUpdates: boolean
}

interface TeamSettings {
  anonymizeDefault: boolean
}

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

const STORAGE_PREFIX = "sentinel-settings-"

function readBoolean(key: string, defaultValue: boolean): boolean {
  if (typeof window === "undefined") return defaultValue
  const stored = localStorage.getItem(STORAGE_PREFIX + key)
  if (stored === null) return defaultValue
  return stored === "true"
}

function writeBoolean(key: string, value: boolean): void {
  localStorage.setItem(STORAGE_PREFIX + key, String(value))
}

// ---------------------------------------------------------------------------
// Role badge color helper
// ---------------------------------------------------------------------------

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "admin":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    case "manager":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    default:
      return ""
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user, userRole } = useAuth()
  const { theme, setTheme } = useTheme()

  const role = userRole?.role ?? "employee"
  const email = user?.email ?? ""
  const isAdmin = role === "admin"
  const isManager = role === "manager"
  const isManagerOrAdmin = isManager || isAdmin
  const isEmployee = role === "employee"

  const [mounted, setMounted] = useState(false)

  // Notification state (localStorage)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailDigest: true,
    riskAlerts: true,
    teamUpdates: false,
  })

  // Team defaults state (localStorage, manager/admin only)
  const [teamSettings, setTeamSettings] = useState<TeamSettings>({
    anonymizeDefault: true,
  })

  // SSR-safe init
  useEffect(() => {
    setNotifications({
      emailDigest: readBoolean("notifications-email-digest", true),
      riskAlerts: readBoolean("notifications-risk-alerts", true),
      teamUpdates: readBoolean("notifications-team-updates", false),
    })
    setTeamSettings({
      anonymizeDefault: readBoolean("anonymize-default", true),
    })
    setMounted(true)
  }, [])

  // ---- Notification handlers (localStorage) ----

  function updateNotification(key: keyof NotificationSettings, value: boolean) {
    const storageKeyMap: Record<keyof NotificationSettings, string> = {
      emailDigest: "notifications-email-digest",
      riskAlerts: "notifications-risk-alerts",
      teamUpdates: "notifications-team-updates",
    }
    writeBoolean(storageKeyMap[key], value)
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  // ---- Team defaults handler (localStorage) ----

  function updateTeamSetting(key: keyof TeamSettings, value: boolean) {
    const storageKeyMap: Record<keyof TeamSettings, string> = {
      anonymizeDefault: "anonymize-default",
    }
    writeBoolean(storageKeyMap[key], value)
    setTeamSettings((prev) => ({ ...prev, [key]: value }))
  }

  // ---- Theme buttons ----

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-semibold">
            Settings
          </DialogTitle>
          <DialogDescription className="sr-only">
            Configure your preferences and account settings
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6 space-y-8">
          {/* ----------------------------------------------------------- */}
          {/* Appearance                                                    */}
          {/* ----------------------------------------------------------- */}
          <section className="border-b border-border pb-6">
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-2">
              <Palette className="h-3.5 w-3.5" />
              Appearance
            </h3>
            <div className="flex gap-2">
              {mounted &&
                themeOptions.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={theme === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme(value)}
                    className="flex-1 gap-1.5 text-xs"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Button>
                ))}
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* Notifications                                                */}
          {/* ----------------------------------------------------------- */}
          <section className="border-b border-border pb-6">
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-2">
              <Bell className="h-3.5 w-3.5" />
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label
                    htmlFor="settings-email-digest"
                    className="text-sm text-foreground"
                  >
                    Email digest
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Receive weekly summary of team health metrics</p>
                </div>
                {mounted && (
                  <Switch
                    id="settings-email-digest"
                    checked={notifications.emailDigest}
                    onCheckedChange={(v) =>
                      updateNotification("emailDigest", v)
                    }
                    className="mt-0.5"
                  />
                )}
              </div>

              {isManagerOrAdmin && (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label
                        htmlFor="settings-risk-alerts"
                        className="text-sm text-foreground"
                      >
                        Risk alerts
                      </Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Get notified when team members reach elevated or critical risk</p>
                    </div>
                    {mounted && (
                      <Switch
                        id="settings-risk-alerts"
                        checked={notifications.riskAlerts}
                        onCheckedChange={(v) =>
                          updateNotification("riskAlerts", v)
                        }
                        className="mt-0.5"
                      />
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label
                        htmlFor="settings-team-updates"
                        className="text-sm text-foreground"
                      >
                        Team updates
                      </Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Updates on team composition and role changes</p>
                    </div>
                    {mounted && (
                      <Switch
                        id="settings-team-updates"
                        checked={notifications.teamUpdates}
                        onCheckedChange={(v) =>
                          updateNotification("teamUpdates", v)
                        }
                        className="mt-0.5"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* Privacy info (read-only)                                      */}
          {/* ----------------------------------------------------------- */}
          <section className="border-b border-border pb-6">
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              Privacy
            </h3>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5">
              <p className="text-xs text-foreground font-medium">Your data is protected by design</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Sentinel analyzes behavioral metadata only (timestamps, event counts).
                All identities are HMAC-SHA256 hashed. No message content, code, or files are ever accessed.
                Names are only revealed for critical safety interventions with a full audit trail.
              </p>
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* Team Defaults (manager only — admins see real names)          */}
          {/* ----------------------------------------------------------- */}
          {isManager && !isAdmin && (
            <section className="border-b border-border pb-6">
              <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-2">
                <Users2 className="h-3.5 w-3.5" />
                Team Defaults
              </h3>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label
                    htmlFor="settings-anonymize"
                    className="text-sm text-foreground"
                  >
                    Default anonymization
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Show anonymized employee names by default in engine views</p>
                </div>
                {mounted && (
                  <Switch
                    id="settings-anonymize"
                    checked={teamSettings.anonymizeDefault}
                    onCheckedChange={(v) =>
                      updateTeamSetting("anonymizeDefault", v)
                    }
                    className="mt-0.5"
                  />
                )}
              </div>
            </section>
          )}

          {/* ----------------------------------------------------------- */}
          {/* Account Info (read-only)                                      */}
          {/* ----------------------------------------------------------- */}
          <section>
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              Account
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm text-foreground font-mono truncate max-w-[200px]">
                  {email || "\u2014"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge
                  variant="outline"
                  className={`capitalize text-xs ${getRoleBadgeClass(role)}`}
                >
                  {role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm text-foreground font-mono">1.0.0-beta</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <a href="/privacy" className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer">
                  Privacy Policy
                </a>
                <a href="https://github.com/algoquest" className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
