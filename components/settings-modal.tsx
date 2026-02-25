'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Pause, Play, Trash2, Share2, Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

interface SettingsModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

interface ConsentSettings {
  consent_share_with_manager: boolean
  consent_share_anonymized: boolean
}

const settingsCache: { data: { user: ConsentSettings; monitoringPaused: boolean } | null; timestamp: number } = {
  data: null,
  timestamp: 0,
}
const CACHE_TTL = 30000

export function SettingsModal({ open, onOpenChange, trigger }: SettingsModalProps) {
  const [settings, setSettings] = useState<ConsentSettings>({
    consent_share_with_manager: false,
    consent_share_anonymized: false,
  })
  const [monitoringPaused, setMonitoringPaused] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (open && !loadingRef.current) {
      loadSettings()
    }
  }, [open])

  const loadSettings = async () => {
    if (!open || loadingRef.current) return
    
    const now = Date.now()
    if (settingsCache.data && (now - settingsCache.timestamp) < CACHE_TTL) {
      setSettings({
        consent_share_with_manager: settingsCache.data.user.consent_share_with_manager,
        consent_share_anonymized: settingsCache.data.user.consent_share_anonymized,
      })
      setMonitoringPaused(settingsCache.data.monitoringPaused)
      setIsLoading(false)
      return
    }
    
    loadingRef.current = true
    setIsLoading(true)
    try {
      const response = await api.get<{ user: ConsentSettings; monitoring_status: { is_paused: boolean } }>('/me/')
      const data = {
        user: {
          consent_share_with_manager: response.user.consent_share_with_manager,
          consent_share_anonymized: response.user.consent_share_anonymized,
        },
        monitoringPaused: response.monitoring_status.is_paused,
      }
      settingsCache.data = data
      settingsCache.timestamp = Date.now()
      setSettings(data.user)
      setMonitoringPaused(data.monitoringPaused)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }

  const updateSetting = async (key: keyof ConsentSettings, value: boolean) => {
    setIsSaving(true)
    setMessage(null)
    try {
      const newSettings = { ...settings, [key]: value }
      await api.post('/me/consent/', {
        consent_share_with_manager: newSettings.consent_share_with_manager,
        consent_share_anonymized: newSettings.consent_share_anonymized,
      })
      setSettings(newSettings)
      setMessage({ type: 'success', text: 'Settings saved successfully' })
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePauseResume = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      if (monitoringPaused) {
        await api.post('/me/resume-monitoring/', {})
        setMonitoringPaused(false)
        setMessage({ type: 'success', text: 'Monitoring resumed' })
      } else {
        await api.post('/me/pause-monitoring/', { hours: 24 })
        setMonitoringPaused(true)
        setMessage({ type: 'success', text: 'Monitoring paused for 24 hours' })
      }
    } catch (error) {
      console.error('Failed to toggle monitoring:', error)
      setMessage({ type: 'error', text: 'Failed to toggle monitoring' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteData = async () => {
    setIsSaving(true)
    try {
      await api.delete('/me/data/?confirm=true')
      setShowDeleteConfirm(false)
      setMessage({ type: 'success', text: 'All data deleted' })
    } catch (error) {
      console.error('Failed to delete data:', error)
      setMessage({ type: 'error', text: 'Failed to delete data' })
    } finally {
      setIsSaving(false)
    }
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
          {isLoading && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Consent Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none">
                      Share with Manager
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Allow your manager to see your individual insights
                    </p>
                  </div>
                  <Switch
                    checked={settings.consent_share_with_manager}
                    onCheckedChange={(checked) => updateSetting('consent_share_with_manager', checked)}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none">
                      Anonymous Data
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Include anonymized data in team aggregates
                    </p>
                  </div>
                  <Switch
                    checked={settings.consent_share_anonymized}
                    onCheckedChange={(checked) => updateSetting('consent_share_anonymized', checked)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                {monitoringPaused ? (
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
                    {monitoringPaused
                      ? 'Monitoring is currently paused'
                      : 'Temporarily pause all activity tracking'}
                  </p>
                </div>
                <Button
                  variant={monitoringPaused ? 'default' : 'outline'}
                  size="sm"
                  onClick={handlePauseResume}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : monitoringPaused ? (
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
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                      </Button>
                    </div>
                  )}
                </div>
                {showDeleteConfirm && (
                  <p className="text-xs text-destructive mt-2">
                    Click confirm to permanently delete all your data. This action cannot be undone.
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
