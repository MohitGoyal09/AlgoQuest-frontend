'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Pause, Play, Trash2, Share2, Shield, Eye, EyeOff } from 'lucide-react'

interface SettingsModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

interface PrivacySettings {
  analyticsConsent: boolean
  marketingConsent: boolean
  dataSharing: boolean
  monitoringPaused: boolean
}

export function SettingsModal({ open, onOpenChange, trigger }: SettingsModalProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    analyticsConsent: true,
    marketingConsent: false,
    dataSharing: false,
    monitoringPaused: false,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const updateSetting = (key: keyof PrivacySettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handlePauseResume = () => {
    updateSetting('monitoringPaused', !settings.monitoringPaused)
  }

  const handleDeleteData = () => {
    console.log('Deleting user data...')
    setShowDeleteConfirm(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </DialogTitle>
          <DialogDescription>
            Manage your privacy preferences and data settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Consent Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium leading-none">
                    Analytics
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Allow anonymous usage data collection
                  </p>
                </div>
                <Switch
                  checked={settings.analyticsConsent}
                  onCheckedChange={(checked) =>
                    updateSetting('analyticsConsent', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium leading-none">
                    Marketing Communications
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Receive updates about new features
                  </p>
                </div>
                <Switch
                  checked={settings.marketingConsent}
                  onCheckedChange={(checked) =>
                    updateSetting('marketingConsent', checked)
                  }
                />
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              {settings.monitoringPaused ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Monitoring Control
            </h3>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none">
                  Pause Monitoring
                </label>
                <p className="text-xs text-muted-foreground">
                  {settings.monitoringPaused
                    ? 'Monitoring is currently paused'
                    : 'Temporarily pause all activity tracking'}
                </p>
              </div>
              <Button
                variant={settings.monitoringPaused ? 'default' : 'outline'}
                size="sm"
                onClick={handlePauseResume}
                className="gap-2"
              >
                {settings.monitoringPaused ? (
                  <>
                    <Play className="h-3 w-3" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-3 w-3" />
                    Pause
                  </>
                )}
              </Button>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Data Sharing
            </h3>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none">
                  Share Data with Third Parties
                </label>
                <p className="text-xs text-muted-foreground">
                  Help improve our services by sharing anonymized data
                </p>
              </div>
              <Switch
                checked={settings.dataSharing}
                onCheckedChange={(checked) =>
                  updateSetting('dataSharing', checked)
                }
              />
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Data Management
            </h3>
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium leading-none">
                    Delete All Data
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Permanently remove all your stored data
                  </p>
                </div>
                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Delete Data
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteData}
                    >
                      Confirm
                    </Button>
                  </div>
                )}
              </div>
              {showDeleteConfirm && (
                <p className="text-xs text-destructive mt-2">
                  Click confirm to permanently delete all your data. This
                  action cannot be undone.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => onOpenChange?.(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal
