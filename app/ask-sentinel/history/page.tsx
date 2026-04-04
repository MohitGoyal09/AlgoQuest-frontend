"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MessageCircle, Search, Clock, ArrowLeft, PenSquare, Star,
  Trash2, MoreHorizontal,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useChatHistory, ChatSessionSummary } from "@/hooks/useChatHistory"
import { deleteChatSession } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatRelative(iso: string | null): string {
  if (!iso) return ""
  try {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  } catch {
    return ""
  }
}

function groupByDate(sessions: ChatSessionSummary[]): Record<string, ChatSessionSummary[]> {
  const groups: Record<string, ChatSessionSummary[]> = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  for (const s of sessions) {
    const date = new Date(s.updated_at || s.created_at || "")
    let label: string
    if (date >= today) label = "Today"
    else if (date >= yesterday) label = "Yesterday"
    else if (date >= weekAgo) label = "This Week"
    else label = "Older"

    if (!groups[label]) groups[label] = []
    groups[label].push(s)
  }
  return groups
}

// ── Components ──────────────────────────────────────────────────────────────

function SessionRow({
  session,
  onDelete,
}: {
  session: ChatSessionSummary
  onDelete: (id: string) => void
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/30 transition-colors">
      <Link
        href={`/ask-sentinel?session=${session.id}`}
        className="flex flex-1 items-center gap-3 min-w-0"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/40">
          <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {session.title}
            </p>
            {session.is_favorite && (
              <Star className="h-3 w-3 shrink-0 text-amber-400 fill-amber-400" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {formatRelative(session.updated_at)}
          </p>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/0 group-hover:text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onDelete(session.id)}
            className="text-red-400"
          >
            <Trash2 className="h-3 w-3 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────

function HistoryContent() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const { sessions, isLoading, error, refetch } = useChatHistory({ limit: 100 })

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions
    const lower = search.toLowerCase()
    return sessions.filter((s) => s.title.toLowerCase().includes(lower))
  }, [sessions, search])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])
  const groupOrder = ["Today", "Yesterday", "This Week", "Older"]

  const handleDelete = async (id: string) => {
    try {
      await deleteChatSession(id)
      refetch()
      toast.success("Chat deleted")
    } catch {
      toast.error("Failed to delete")
    }
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h1 className="text-xl font-bold text-foreground">Chat History</h1>
              {sessions.length > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {sessions.length} conversations
                </span>
              )}
            </div>
            <Link
              href="/ask-sentinel"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              title="New Chat"
            >
              <PenSquare className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-muted/20 animate-pulse" />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex flex-col items-center gap-3 py-20">
              <MessageCircle className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">Failed to load chat history</p>
              <button
                onClick={refetch}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20">
              <MessageCircle className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">
                {search ? "No conversations match your search" : "No conversations yet"}
              </p>
              {!search && (
                <Link
                  href="/ask-sentinel"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Start your first conversation
                </Link>
              )}
            </div>
          )}

          {/* Grouped sessions */}
          {!isLoading && !error && filtered.length > 0 && (
            <div className="space-y-6">
              {groupOrder.map((label) => {
                const group = grouped[label]
                if (!group || group.length === 0) return null
                return (
                  <div key={label}>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <div className="space-y-0.5">
                      {group.map((session) => (
                        <SessionRow
                          key={session.id}
                          session={session}
                          onDelete={(id) => setDeleteTarget(id)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  )
}
