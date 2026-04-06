"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Users, TrendingUp, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SkillsRadar } from "@/components/skills-radar"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ProfileModalProps {
  userHash: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ProfileData {
  user_hash: string
  name: string
  role: string
  team: string | null
  date_joined: string | null
  risk: {
    risk_level: string
    velocity: number
    confidence: number
    belongingness_score: number
    attrition_probability: number
  } | null
  skills: {
    technical: number
    communication: number
    leadership: number
    collaboration: number
    adaptability: number
    creativity: number
  } | null
  network: {
    betweenness: number
    eigenvector: number
    unblocking_count: number
  } | null
}

const riskBadge = (level: string) => {
  switch (level) {
    case "CRITICAL": return "bg-[hsl(var(--sentinel-critical))]/10 text-[hsl(var(--sentinel-critical))] border-[hsl(var(--sentinel-critical))]/20"
    case "ELEVATED": return "bg-[hsl(var(--sentinel-elevated))]/10 text-[hsl(var(--sentinel-elevated))] border-[hsl(var(--sentinel-elevated))]/20"
    default: return "bg-[hsl(var(--sentinel-healthy))]/10 text-[hsl(var(--sentinel-healthy))] border-[hsl(var(--sentinel-healthy))]/20"
  }
}

export function ProfileModal({ userHash, open, onOpenChange }: ProfileModalProps) {
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !userHash) return
    setLoading(true)
    api.get<{ success: boolean; data: ProfileData }>(`/me/profile/${userHash}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [open, userHash])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
                  {data.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-base font-semibold">{data.name}</DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] capitalize">{data.role}</Badge>
                    {data.team && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {data.team}
                      </span>
                    )}
                    {data.risk && (
                      <Badge variant="outline" className={cn("text-[10px]", riskBadge(data.risk.risk_level))}>
                        {data.risk.risk_level}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-6">
              {/* Key Metrics */}
              {data.risk && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Velocity", value: data.risk.velocity.toFixed(1), sub: "pts/week" },
                    { label: "Belonging", value: `${(data.risk.belongingness_score * 100).toFixed(0)}%`, sub: "integration" },
                    { label: "Attrition", value: `${(data.risk.attrition_probability * 100).toFixed(0)}%`, sub: "30-day risk" },
                    { label: "Confidence", value: `${(data.risk.confidence * 100).toFixed(0)}%`, sub: "model" },
                  ].map(m => (
                    <div key={m.label} className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{m.label}</p>
                      <p className="text-lg font-semibold tabular-nums text-foreground mt-1">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.sub}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Radar */}
              {data.skills && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Skill Profile
                  </p>
                  <SkillsRadar data={data.skills} height={220} />
                </div>
              )}

              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {data.date_joined && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined {new Date(data.date_joined).toLocaleDateString()}</span>
                  </div>
                )}
                {data.network && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Unblocks {data.network.unblocking_count} people</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    onOpenChange(false)
                    router.push(`/ask-sentinel?q=${encodeURIComponent(`Prepare a 1:1 agenda for ${data.name}`)}`)
                  }}
                >
                  Schedule 1:1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    onOpenChange(false)
                    router.push(`/ask-sentinel?q=${encodeURIComponent(`What coaching advice do you have for ${data.name}?`)}`)
                  }}
                >
                  Ask Copilot
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Failed to load profile
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
