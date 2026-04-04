"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
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

interface PrivacySettings {
  shareWithManager: boolean
  pauseMonitoring: boolean
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

  // Privacy state (API-backed, employee only)
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    shareWithManager: userRole?.consent_share_with_manager ?? false,
    pauseMonitoring: false,
  })
  const [privacyLoading, setPrivacyLoading] = useState(false)

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

  // Sync privacy state from auth context when modal opens
  useEffect(() => {
    if (open && userRole) {
      setPrivacy((prev) => ({
        ...prev,
        shareWithManager: userRole.consent_share_with_manager ?? false,
      }))
    }
  }, [open, userRole])

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

  // ---- Privacy handlers (API-backed) ----

  async function handleConsentChange(value: boolean) {
    setPrivacyLoading(true)
    try {
      await api.put("/me/consent", {
        consent_share_with_manager: value,
      })
      setPrivacy((prev) => ({ ...prev, shareWithManager: value }))
      toast.success(
        value
          ? "Data sharing with manager enabled"
          : "Data sharing with manager disabled"
      )
    } catch {
      toast.error("Failed to update consent setting")
    } finally {
      setPrivacyLoading(false)
    }
  }

  async function handlePauseMonitoring(value: boolean) {
    setPrivacyLoading(true)
    try {
      if (value) {
        await api.post("/me/pause-monitoring", { hours: 24 })
        toast.success("Monitoring paused for 24 hours")
      } else {
        await api.post("/me/resume-monitoring")
        toast.success("Monitoring resumed")
      }
      setPrivacy((prev) => ({ ...prev, pauseMonitoring: value }))
    } catch {
      toast.error("Failed to update monitoring status")
    } finally {
      setPrivacyLoading(false)
    }
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
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-semibold">
            Settings
          </DialogTitle>
          <DialogDescription className="sr-only">
            Configure your preferences and account settings
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 pb-6 space-y-6">
          {/* ----------------------------------------------------------- */}
          {/* Appearance                                                    */}
          {/* ----------------------------------------------------------- */}
          <section>
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
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
          <section>
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="settings-email-digest"
                  className="text-sm text-foreground"
                >
                  Email digest
                </Label>
                {mounted && (
                  <Switch
                    id="settings-email-digest"
                    checked={notifications.emailDigest}
                    onCheckedChange={(v) =>
                      updateNotification("emailDigest", v)
                    }
                  />
                )}
              </div>

              {isManagerOrAdmin && (
                <>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="settings-risk-alerts"
                      className="text-sm text-foreground"
                    >
                      Risk alerts
                    </Label>
                    {mounted && (
                      <Switch
                        id="settings-risk-alerts"
                        checked={notifications.riskAlerts}
                        onCheckedChange={(v) =>
                          updateNotification("riskAlerts", v)
                        }
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="settings-team-updates"
                      className="text-sm text-foreground"
                    >
                      Team updates
                    </Label>
                    {mounted && (
                      <Switch
                        id="settings-team-updates"
                        checked={notifications.teamUpdates}
                        onCheckedChange={(v) =>
                          updateNotification("teamUpdates", v)
                        }
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ----------------------------------------------------------- */}
          {/* Privacy (employee only)                                       */}
          {/* ----------------------------------------------------------- */}
          {isEmployee && (
            <section>
              <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Privacy
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="settings-share-manager"
                    className="text-sm text-foreground"
                  >
                    Share data with manager
                  </Label>
                  <Switch
                    id="settings-share-manager"
                    checked={privacy.shareWithManager}
                    onCheckedChange={handleConsentChange}
                    disabled={privacyLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="settings-pause-monitoring"
                    className="text-sm text-foreground"
                  >
                    Pause monitoring
                  </Label>
                  <Switch
                    id="settings-pause-monitoring"
                    checked={privacy.pauseMonitoring}
                    onCheckedChange={handlePauseMonitoring}
                    disabled={privacyLoading}
                  />
                </div>
              </div>
            </section>
          )}

          {/* ----------------------------------------------------------- */}
          {/* Team Defaults (manager only — admins see real names)          */}
          {/* ----------------------------------------------------------- */}
          {isManager && !isAdmin && (
            <section>
              <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Team Defaults
              </h3>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="settings-anonymize"
                  className="text-sm text-foreground"
                >
                  Default anonymization
                </Label>
                {mounted && (
                  <Switch
                    id="settings-anonymize"
                    checked={teamSettings.anonymizeDefault}
                    onCheckedChange={(v) =>
                      updateTeamSetting("anonymizeDefault", v)
                    }
                  />
                )}
              </div>
            </section>
          )}

          {/* ----------------------------------------------------------- */}
          {/* Account Info (read-only)                                      */}
          {/* ----------------------------------------------------------- */}
          <section>
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
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
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
