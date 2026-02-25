"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  Shield,
  Trash2,
  AlertTriangle,
  EyeOff,
  History,
  Radio,
  PauseCircle,
  PlayCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
  Brain,
  Target,
  LogOut,
  LayoutDashboard,
  Calendar,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// AI & Charts
import { RiskNarrative } from "@/components/ai/RiskNarrative"
import { SkillsRadar } from "@/components/skills-radar"
import { VelocityChart } from "@/components/velocity-chart"
import { NudgeCard } from "@/components/nudge-card"

// Hooks
import { useRiskHistory } from "@/hooks/useRiskHistory"
import { useNudge } from "@/hooks/useNudge"

// API client
import { api } from "@/lib/api"
import { HistoryPoint } from "@/types"

interface UserProfile {
  user_hash: string
  role: string
  consent_share_with_manager: boolean
  consent_share_anonymized: boolean
  monitoring_paused_until: string | null
  created_at: string
}

interface RiskData {
  velocity: number | null
  risk_level: string
  confidence: number
  thwarted_belongingness: number | null
  updated_at: string | null
}

interface MonitoringStatus {
  is_paused: boolean
  paused_until: string | null
}

interface AuditEntry {
  action: string
  timestamp: string
  details: any
}

interface MeData {
  user: UserProfile
  risk: RiskData | null
  audit_trail: AuditEntry[]
  monitoring_status: MonitoringStatus
}

// ─── Utility: Risk level colors + glow ────────────────────────
const riskConfig: Record<string, { label: string; color: string; glow: string; bgClass: string; accentClass: string }> = {
  CRITICAL: {
    label: "Critical",
    color: "hsl(var(--sentinel-critical))",
    glow: "var(--glow-critical)",
    bgClass: "bg-red-500/10",
    accentClass: "glass-card-accent--critical",
  },
  ELEVATED: {
    label: "Elevated",
    color: "hsl(var(--sentinel-elevated))",
    glow: "var(--glow-elevated)",
    bgClass: "bg-amber-500/10",
    accentClass: "glass-card-accent--elevated",
  },
  LOW: {
    label: "Healthy",
    color: "hsl(var(--sentinel-healthy))",
    glow: "var(--glow-healthy)",
    bgClass: "bg-emerald-500/10",
    accentClass: "glass-card-accent--healthy",
  },
}

function getRisk(level: string | undefined) {
  return riskConfig[level || "LOW"] || riskConfig.LOW
}

export default function MePage() {
  return (
    <ProtectedRoute>
      <MePageContent />
    </ProtectedRoute>
  )
}

function MePageContent() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [data, setData] = useState<MeData | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  // Fetch history and nudge data using hooks
  // Note: user_hash might be undefined initially, but hook handles null safely
  const { history, isLoading: isHistoryLoading } = useRiskHistory(data?.user?.user_hash || null)
  const { data: nudgeData } = useNudge(data?.user?.user_hash || null)

  useEffect(() => {
    fetchMeData()
  }, [])

  const fetchMeData = async () => {
    try {
      setIsDataLoading(true)
      const data = await api.get<MeData>('/me')
      if (data && data.user) {
        setData(data)
        setError(null)
      } else {
        setError("Failed to load your data")
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load your data")
    } finally {
      setIsDataLoading(false)
    }
  }

  const updateConsent = async (type: "manager" | "anonymized", value: boolean) => {
    try {
      setUpdating(true)
      const payload = type === "manager"
        ? { consent_share_with_manager: value }
        : { consent_share_anonymized: value }

      await api.put("/me/consent", payload)
      await fetchMeData()
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update consent")
    } finally {
      setUpdating(false)
    }
  }

  const pauseMonitoring = async (hours: number) => {
    try {
      setUpdating(true)
      await api.post(`/me/pause-monitoring?hours=${hours}`, {})
      await fetchMeData()
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to pause monitoring")
    } finally {
      setUpdating(false)
    }
  }

  const resumeMonitoring = async () => {
    try {
      setUpdating(true)
      await api.post("/me/resume-monitoring", {})
      await fetchMeData()
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to resume monitoring")
    } finally {
      setUpdating(false)
    }
  }

  const deleteAllData = async () => {
    if (deleteConfirmText !== "DELETE") {
      setError("Please type DELETE to confirm")
      return
    }
    try {
      setUpdating(true)
      await api.delete("/me/data?confirm=true")
      await signOut()
      router.push("/login")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete data")
      setUpdating(false)
    }
  }

  // Mock Skills Data (Since we don't have an endpoint for it yet)
  const mockSkillsData = {
    technical: 85,
    communication: 72,
    leadership: 65,
    collaboration: 90,
    adaptability: 80,
    creativity: 75,
    updated_at: new Date().toISOString()
  }

  // ─── Loading State ──────────────────────────────────────
  if (isDataLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-[hsl(var(--sentinel-healthy))] border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading your wellbeing data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="glass-card rounded-xl p-8 text-center max-w-md">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--sentinel-critical))]" />
          <h3 className="text-lg font-semibold text-foreground mb-1">Something went wrong</h3>
          <p className="text-sm text-muted-foreground">{error || "Failed to load data"}</p>
        </div>
      </div>
    )
  }

  const risk = getRisk(data.risk?.risk_level)

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-950/50 border border-indigo-500/30">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">My Wellbeing</h1>
              <div className="flex items-center gap-2">
                 <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[10px] font-mono text-muted-foreground leading-none">
                   LIVE MONITORING
                 </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
               <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Role:</span>
               <Badge variant="outline" className="text-[10px] h-5 border-border bg-background capitalize">
                  {data.user.role}
               </Badge>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="ghost" size="sm" onClick={() => router.push("/engines")} className="text-muted-foreground hover:text-foreground">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Console
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="container mx-auto px-6 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-xs hover:underline">Dismiss</button>
          </div>
        )}

        {/* ─── Top Metrics Row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Risk Card */}
           <Card className={`border-l-4 ${risk.accentClass} bg-card/50 backdrop-blur-sm`}>
              <CardContent className="p-4 pt-5">
                 <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Risk</p>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                 </div>
                 <div className="text-2xl font-bold tracking-tight" style={{ color: risk.color }}>
                    {data.risk?.risk_level || "CALCULATING"}
                 </div>
                 <p className="text-[10px] text-muted-foreground mt-1">
                    Based on recent activity analysis
                 </p>
              </CardContent>
           </Card>

           {/* Velocity Card */}
           <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 pt-5">
                 <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Velocity Score</p>
                    <Zap className="h-4 w-4 text-blue-400" />
                 </div>
                 <div className="text-2xl font-bold text-foreground">
                    {data.risk?.velocity?.toFixed(2) || "0.00"}
                 </div>
                 <p className="text-[10px] text-muted-foreground mt-1">
                    Story points / week average
                 </p>
              </CardContent>
           </Card>

           {/* Belongingness Card */}
           <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 pt-5">
                 <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Belongingness</p>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                 </div>
                 <div className="text-2xl font-bold text-foreground">
                    {data.risk?.thwarted_belongingness ? ((1 - data.risk.thwarted_belongingness) * 100).toFixed(0) : "N/A"}%
                 </div>
                 <p className="text-[10px] text-muted-foreground mt-1">
                    Team integration score
                 </p>
              </CardContent>
           </Card>

           {/* Confidence Card */}
           <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 pt-5">
                 <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Confidence</p>
                    <Brain className="h-4 w-4 text-purple-400" />
                 </div>
                 <div className="text-2xl font-bold text-foreground">
                    {((data.risk?.confidence || 0) * 100).toFixed(0)}%
                 </div>
                 <p className="text-[10px] text-muted-foreground mt-1">
                    Model certainty metric
                 </p>
              </CardContent>
           </Card>
        </div>

        {/* ─── Main Content Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* LEFT COLUMN (Charts) */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Burnout Risk History */}
              <div className="space-y-2">
                 <h2 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> Burnout Risk History
                 </h2>
                 {isHistoryLoading ? (
                    <Card className="glass-card">
                       <CardContent className="flex h-60 items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                       </CardContent>
                    </Card>
                 ) : (
                    <VelocityChart history={history as HistoryPoint[]} title="Work Velocity vs. Belongingness (30 Days)" />
                 )}
              </div>

               {/* Skills & Narrative Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Skill Graph */}
                 <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                       <Target className="h-5 w-5 text-purple-400" /> Skill Topology
                    </h2>
                    <Card className="glass-card">
                       <CardContent className="p-4 pt-6">
                          <SkillsRadar data={mockSkillsData} height={250} />
                       </CardContent>
                    </Card>
                 </div>

                 {/* AI Narrative */}
                 <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                       <Brain className="h-5 w-5 text-indigo-400" /> Risk Analysis
                    </h2>
                    {data.user && (
                      <RiskNarrative 
                         userHash={data.user.user_hash} 
                         timeRange={14} 
                         className="h-full"
                      />
                    )}
                 </div>
              </div>
           </div>

           {/* RIGHT COLUMN (Actions & Settings) */}
           <div className="space-y-6">
              
              {/* AI Suggestions (Nudge) */}
              <div className="space-y-2">
                 <h2 className="text-lg font-semibold flex items-center gap-2 text-amber-500">
                    <Zap className="h-5 w-5" /> Sentinel Suggestions
                 </h2>
                 {nudgeData ? (
                    <NudgeCard nudge={nudgeData} />
                 ) : (
                    <Card className="border-border/50 bg-card/40">
                       <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                          <Brain className="h-8 w-8 mb-2 opacity-20" />
                          <p>No active suggestions at this time.</p>
                       </CardContent>
                    </Card>
                 )}
              </div>

              {/* Monitoring Controls */}
              <Card className="glass-card">
                 <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                       <Radio className="h-4 w-4 text-[hsl(var(--sentinel-gem))]" />
                       Monitoring Controls
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-4 space-y-4">
                    {data.monitoring_status.is_paused ? (
                       <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                          <div className="flex items-center gap-2 text-amber-500 mb-1">
                             <PauseCircle className="h-4 w-4" />
                             <span className="text-xs font-bold">PAUSED</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                             Resumes: {new Date(data.monitoring_status.paused_until!).toLocaleString()}
                          </p>
                       </div>
                    ) : (
                       <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                          <div className="flex items-center gap-2 text-emerald-500 mb-1">
                             <PlayCircle className="h-4 w-4" />
                             <span className="text-xs font-bold">ACTIVE</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                             System is analyzing work patterns.
                          </p>
                       </div>
                    )}

                    <div>
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Quick Pause</Label>
                       <div className="grid grid-cols-3 gap-2">
                          {[8, 24, 72].map((hours) => (
                             <Button
                                key={hours}
                                variant="outline"
                                size="sm"
                                disabled={updating || data.monitoring_status.is_paused}
                                onClick={() => pauseMonitoring(hours)}
                                className="text-xs h-8"
                             >
                                {hours}h
                             </Button>
                          ))}
                       </div>
                    </div>
                    
                    {data.monitoring_status.is_paused && (
                       <Button onClick={resumeMonitoring} className="w-full h-8 text-xs" variant="secondary">Resume Now</Button>
                    )}
                 </CardContent>
              </Card>

              {/* Privacy Controls */}
              <Card className="glass-card">
                 <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                       <ShieldCheck className="h-4 w-4 text-[hsl(var(--sentinel-info))]" />
                       Privacy Settings
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="space-y-0.5">
                          <Label className="text-xs font-medium">Manager Access</Label>
                          <p className="text-[10px] text-muted-foreground">Allow detailed view</p>
                       </div>
                       <Switch 
                          checked={data.user.consent_share_with_manager}
                          onCheckedChange={(c) => updateConsent("manager", c)}
                          disabled={updating}
                       />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                       <div className="space-y-0.5">
                          <Label className="text-xs font-medium">Team Analytics</Label>
                          <p className="text-[10px] text-muted-foreground">Include anonymized data</p>
                       </div>
                       <Switch 
                          checked={data.user.consent_share_anonymized}
                          onCheckedChange={(c) => updateConsent("anonymized", c)}
                          disabled={updating}
                       />
                    </div>
                 </CardContent>
              </Card>

              {/* Danger Zone Controls (Initially Hidden or Separated) */}
              <div className="pt-4">
                 <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogTrigger asChild>
                       <Button variant="ghost" size="sm" className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20">
                          <Trash2 className="h-3 w-3 mr-2" /> Delete all personal data
                       </Button>
                    </DialogTrigger>
                    <DialogContent>
                       <DialogHeader>
                          <DialogTitle className="text-red-500">Irreversible Action</DialogTitle>
                          <DialogDescription>
                             This will permanently delete your identity, risk scores, and history. 
                             Type <strong>DELETE</strong> to confirm.
                          </DialogDescription>
                       </DialogHeader>
                       <input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                          placeholder="Type DELETE"
                       />
                       <DialogFooter>
                          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                          <Button variant="destructive" onClick={deleteAllData} disabled={updating || deleteConfirmText !== "DELETE"}>
                             {updating ? "Deleting..." : "Confirm Delete"}
                          </Button>
                       </DialogFooter>
                    </DialogContent>
                 </Dialog>
              </div>

           </div>
        </div>

        {/* ─── Footer: Audit Trail ─── */}
        <div className="mt-8">
           <Separator className="mb-6 opacity-30" />
           <div className="grid gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                 <History className="h-4 w-4" />
                 <h3 className="text-sm font-medium uppercase tracking-wider">Access Audit Trail</h3>
              </div>
              <ScrollArea className="h-[200px] rounded-xl border border-border/50 bg-card/30 p-4">
                 {data.audit_trail.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
                       <EyeOff className="h-8 w-8 mb-2 opacity-50" />
                       <p className="text-xs">No recent access logs found.</p>
                    </div>
                 ) : (
                    <div className="space-y-2">
                       {data.audit_trail.map((log, i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
                             <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-[10px] font-mono opacity-70">
                                   {new Date(log.timestamp).toLocaleDateString()}
                                </Badge>
                                <span className="font-medium text-foreground">{log.action.replace(/_/g, " ")}</span>
                             </div>
                             <span className="font-mono text-muted-foreground text-[10px] truncate max-w-[300px]">
                                {JSON.stringify(log.details)}
                             </span>
                          </div>
                       ))}
                    </div>
                 )}
              </ScrollArea>
           </div>
        </div>

      </main>
    </div>
  )
}
