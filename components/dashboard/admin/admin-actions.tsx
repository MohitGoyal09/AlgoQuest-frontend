"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { UserCog, Lock, Database } from "lucide-react"
import { api } from "@/lib/api"

export function AdminQuickActions() {
  const router = useRouter()
  const [anonymityEnabled, setAnonymityEnabled] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleAnonymityToggle = async (value: boolean) => {
    setSaving(true)
    try {
      await api.put("/admin/settings", { force_hashed_ids: value })
      setAnonymityEnabled(value)
    } catch {
      // Revert on failure
      setAnonymityEnabled(!value)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
        className="bg-card border-border hover:border-teal-500/30 transition-colors group cursor-pointer"
        onClick={() => router.push("/admin?tab=users")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <UserCog className="w-5 h-5 text-teal-400" />
            User Management
          </CardTitle>
          <CardDescription>Add, remove, or modify roles.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-card border-border hover:border-purple-500/30 transition-colors group">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Lock className="w-5 h-5 text-purple-400" />
            Global Anonymity
          </CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between mt-2">
              <Label htmlFor="global-privacy" className="text-xs text-muted-foreground">Force Hashed IDs</Label>
              <Switch
                id="global-privacy"
                checked={anonymityEnabled}
                onCheckedChange={handleAnonymityToggle}
                disabled={saving}
              />
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card
        className="bg-card border-border hover:border-blue-500/30 transition-colors group cursor-pointer"
        onClick={() => router.push("/marketplace")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Database className="w-5 h-5 text-blue-400" />
            Integrations
          </CardTitle>
          <CardDescription>
            <div className="flex gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-400">System Healthy</span>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
