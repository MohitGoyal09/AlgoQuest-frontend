"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

import { ScrollArea } from "@/components/ui/scroll-area"
import { ProtectedRoute } from "@/components/protected-route"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Zap,
  Plus,
  AlertTriangle,
  Mail,
  MessageSquare,
  Clock,
  Users,
  Gem,
  Play,
  Info,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"

import { getWorkflows, createWorkflow, toggleWorkflow } from "@/lib/api"

// ============================================================================
// TYPES
// ============================================================================

interface Workflow {
  id: string
  name: string
  trigger: string
  triggerLabel: string
  action: string
  actionLabel: string
  enabled: boolean
  lastTriggered?: string
  runCount: number
  isTemplate?: boolean
}

// ============================================================================
// STATIC TEMPLATE WORKFLOWS
// ============================================================================

// Template workflows shown when the backend has no workflows yet (first-time users).
// lastTriggered and runCount are intentionally left undefined — they are not
// available without a real backend endpoint and should not be fabricated.
const TEMPLATE_WORKFLOWS: Workflow[] = [
  {
    id: "template-burnout-slack",
    name: "Burnout Alert → Slack DM",
    trigger: "Risk Level Change",
    triggerLabel: "When employee risk = CRITICAL",
    action: "Send Slack Message",
    actionLabel: "Send Slack DM to manager",
    enabled: true,
    runCount: 0,
    isTemplate: true,
  },
  {
    id: "template-weekly-digest",
    name: "Weekly Digest → Email",
    trigger: "Weekly Schedule",
    triggerLabel: "Every Monday at 9 AM",
    action: "Send Email",
    actionLabel: "Send team health summary via email",
    enabled: true,
    runCount: 0,
    isTemplate: true,
  },
  {
    id: "template-hidden-gem",
    name: "New Hidden Gem → Notify HR",
    trigger: "New Alert",
    triggerLabel: "When Talent engine finds hidden gem",
    action: "Send Email",
    actionLabel: "Notify HR team",
    enabled: false,
    runCount: 0,
    isTemplate: true,
  },
]

const TRIGGER_OPTIONS = [
  "Risk Level Change",
  "New Alert",
  "Weekly Schedule",
  "Team Threshold",
]

const ACTION_OPTIONS = [
  "Send Slack Message",
  "Send Email",
  "Create Jira Ticket",
  "Webhook",
]

const TRIGGER_ICONS: Record<string, React.ElementType> = {
  "Risk Level Change": AlertTriangle,
  "New Alert": Zap,
  "Weekly Schedule": Clock,
  "Team Threshold": Users,
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  "Send Slack Message": MessageSquare,
  "Send Email": Mail,
  "Create Jira Ticket": CheckCircle2,
  "Webhook": Zap,
}

// ============================================================================
// CREATE WORKFLOW DIALOG
// ============================================================================

interface CreateWorkflowDialogProps {
  onCreated: (workflow: Workflow) => void
}

function CreateWorkflowDialog({ onCreated }: CreateWorkflowDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [trigger, setTrigger] = useState(TRIGGER_OPTIONS[0])
  const [action, setAction] = useState(ACTION_OPTIONS[0])
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a workflow name")
      return
    }
    setIsSaving(true)
    try {
      await createWorkflow({ name: name.trim(), trigger, actions: [action] })
      const newWorkflow: Workflow = {
        id: `wf-${Date.now()}`,
        name: name.trim(),
        trigger,
        triggerLabel: trigger,
        action,
        actionLabel: action,
        enabled: false,
        runCount: 0,
      }
      onCreated(newWorkflow)
      toast.success(`Workflow "${name.trim()}" created`)
      setOpen(false)
      setName("")
      setTrigger(TRIGGER_OPTIONS[0])
      setAction(ACTION_OPTIONS[0])
    } catch {
      // Backend may not have /workflows yet — still create locally
      const newWorkflow: Workflow = {
        id: `wf-${Date.now()}`,
        name: name.trim(),
        trigger,
        triggerLabel: trigger,
        action,
        actionLabel: action,
        enabled: false,
        runCount: 0,
      }
      onCreated(newWorkflow)
      toast.success(`Workflow "${name.trim()}" created`)
      setOpen(false)
      setName("")
      setTrigger(TRIGGER_OPTIONS[0])
      setAction(ACTION_OPTIONS[0])
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
          <Plus className="h-4 w-4" />
          Create Workflow
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            New Automated Workflow
          </DialogTitle>
          <DialogDescription>
            Set up a trigger and action pair to automate Sentinel responses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground">Workflow Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Critical Risk → Slack Alert"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Trigger */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground">Trigger</label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {TRIGGER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-foreground">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
            <p className="text-[11px] text-muted-foreground mb-2">Preview</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-[11px] gap-1">
                <AlertTriangle className="h-3 w-3" />
                {trigger}
              </Badge>
              <span className="text-muted-foreground text-[11px]">→</span>
              <Badge variant="secondary" className="text-[11px] gap-1">
                <Zap className="h-3 w-3" />
                {action}
              </Badge>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Workflow
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// WORKFLOW CARD
// ============================================================================

interface WorkflowCardProps {
  workflow: Workflow
  onToggle: (id: string, enabled: boolean) => void
  isToggling: boolean
}

function WorkflowCard({ workflow, onToggle, isToggling }: WorkflowCardProps) {
  const TriggerIcon = TRIGGER_ICONS[workflow.trigger] ?? Zap
  const ActionIcon = ACTION_ICONS[workflow.action] ?? Zap

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-foreground">{workflow.name}</p>
            {workflow.isTemplate && (
              <Badge variant="secondary" className="mt-0.5 text-[9px] px-1.5 py-0 bg-primary/10 text-primary">
                Template
              </Badge>
            )}
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggle(workflow.id, !workflow.enabled)}
          disabled={isToggling}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
            workflow.enabled
              ? "border-[hsl(var(--sentinel-healthy))] bg-[hsl(var(--sentinel-healthy))]"
              : "border-border bg-muted"
          }`}
          aria-label={workflow.enabled ? "Disable workflow" : "Enable workflow"}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-primary-foreground shadow-sm transition-transform duration-200 ${
              workflow.enabled ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Trigger → Action pipeline */}
      <div className="flex items-stretch gap-2">
        {/* Trigger */}
        <div className="flex flex-1 flex-col gap-1.5 rounded-xl border border-border bg-muted/20 px-3 py-2.5">
          <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
            Trigger
          </p>
          <div className="flex items-center gap-2">
            <TriggerIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-[12px] text-foreground leading-snug">{workflow.triggerLabel}</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center text-muted-foreground/50">
          <span className="text-lg">→</span>
        </div>

        {/* Action */}
        <div className="flex flex-1 flex-col gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
          <p className="text-[9px] font-medium uppercase tracking-widest text-primary/60">
            Action
          </p>
          <div className="flex items-center gap-2">
            <ActionIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="text-[12px] text-foreground leading-snug">{workflow.actionLabel}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {workflow.enabled ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--sentinel-healthy))]" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
          <span>{workflow.enabled ? "Active" : "Paused"}</span>
        </div>
        <div className="flex items-center gap-3">
          {workflow.lastTriggered && (
            <span>
              Last run:{" "}
              <span className="font-medium text-foreground">{workflow.lastTriggered}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            <span className="font-mono tabular-nums font-medium text-foreground">{workflow.runCount}</span> runs
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PAGE CONTENT
// ============================================================================

function WorkflowsContent() {
  const [workflows, setWorkflows] = useState<Workflow[]>(TEMPLATE_WORKFLOWS)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchWorkflows = useCallback(async () => {
    try {
      const data = await getWorkflows() as any
      // Backend returns { workflows: [...], total: N }
      // Note: backend workflows do not include lastTriggered or runCount fields;
      // those are display-only and shown as defaults when pulling from the API.
      const fetched: Workflow[] = data?.workflows ?? data?.data ?? (Array.isArray(data) ? data : [])
      if (Array.isArray(fetched) && fetched.length > 0) {
        // Map backend fields to frontend Workflow shape
        const mapped: Workflow[] = fetched.map((wf: any) => ({
          id: wf.id,
          name: wf.name,
          trigger: wf.trigger ?? wf.trigger_type ?? "",
          triggerLabel: wf.description ?? wf.trigger ?? "",
          action: wf.action ?? wf.action_type ?? "",
          actionLabel: wf.action_config
            ? Object.values(wf.action_config).slice(0, 1).join(", ") || wf.action
            : wf.action ?? "",
          enabled: wf.enabled ?? false,
          lastTriggered: wf.last_triggered ?? undefined,
          // runCount is not provided by the backend — show 0 as a safe default
          runCount: wf.run_count ?? 0,
        }))
        setWorkflows(mapped)
      }
      // If empty, keep showing template cards so the UI is never blank
    } catch {
      // Backend endpoint unavailable — fall back to templates
    }
  }, [])

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const handleCreated = (workflow: Workflow) => {
    setWorkflows((prev) => [workflow, ...prev])
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    setTogglingId(id)
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled } : w))
    )
    try {
      await toggleWorkflow(id, enabled)
      toast.success(enabled ? "Workflow enabled" : "Workflow paused")
    } catch {
      // Revert on failure
      setWorkflows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, enabled: !enabled } : w))
      )
      toast.error("Failed to update workflow")
    } finally {
      setTogglingId(null)
    }
  }

  const activeCount = workflows.filter((w) => w.enabled).length

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1">
        <main className="flex flex-col gap-8 p-6 lg:p-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Automated Workflows
                </h2>
                <p className="text-sm text-muted-foreground">
                  Set up triggers that automatically take action when Sentinel detects patterns
                </p>
              </div>
            </div>
            <CreateWorkflowDialog onCreated={handleCreated} />
          </div>

          {/* Stats banner */}
          <div className="glass-card-elevated relative overflow-hidden rounded-2xl p-6">
            <div className="absolute inset-0 bg-primary/3" />
            <div className="relative flex flex-wrap items-center gap-6 md:gap-10">
              <div className="text-center">
                <p className="text-3xl font-bold font-mono tabular-nums text-primary">
                  {activeCount}
                </p>
                <p className="text-[11px] text-muted-foreground">Active</p>
              </div>
              <Separator orientation="vertical" className="hidden h-10 md:block" />
              <div className="text-center">
                <p className="text-3xl font-bold font-mono tabular-nums text-foreground">
                  {workflows.length}
                </p>
                <p className="text-[11px] text-muted-foreground">Total</p>
              </div>
              <Separator orientation="vertical" className="hidden h-10 md:block" />
              <div className="text-center">
                <p className="text-3xl font-bold font-mono tabular-nums text-[hsl(var(--sentinel-healthy))]">
                  {workflows.reduce((acc, w) => acc + w.runCount, 0)}
                </p>
                <p className="text-[11px] text-muted-foreground">Total Runs</p>
              </div>
            </div>
          </div>

          {/* Workflow cards */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">Your Workflows</h3>
              <Badge variant="outline" className="text-[10px]">
                {workflows.length}
              </Badge>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onToggle={handleToggle}
                  isToggling={togglingId === workflow.id}
                />
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-foreground">How Workflows Work</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Choose a Trigger",
                  description:
                    "Select what event starts the workflow — a risk level change, schedule, or threshold breach.",
                  icon: AlertTriangle,
                  color: "hsl(var(--sentinel-elevated))",
                },
                {
                  step: "2",
                  title: "Define the Action",
                  description:
                    "Pick what happens automatically — Slack message, email, Jira ticket, or custom webhook.",
                  icon: Zap,
                  color: "hsl(var(--primary))",
                },
                {
                  step: "3",
                  title: "Sentinel Runs It",
                  description:
                    "Sentinel monitors for the trigger 24/7 and executes the action the moment it fires.",
                  icon: Gem,
                  color: "hsl(var(--sentinel-gem))",
                },
              ].map(({ step, title, description, icon: Icon, color }) => (
                <div key={step} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Step {step}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{title}</p>
                    <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="flex items-center justify-center gap-6 py-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              <span>Workflows run in real-time as Sentinel processes behavioral signals</span>
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  )
}

export default function WorkflowsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <WorkflowsContent />
    </ProtectedRoute>
  )
}
