"use client"

import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

interface MessageActionsProps {
  messageId: string
  copiedId: string | null
  isLastAssistant: boolean
  onCopy: (id: string) => void
  onRegenerate: () => void
  onFeedback: (type: "positive" | "negative") => void
}

// ─── Action Button ──────────────────────────────────────────────────────────

function ActionButton({
  title,
  onClick,
  children,
  className,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "h-7 w-7 flex items-center justify-center rounded-md",
        "text-muted-foreground/40 hover:text-foreground hover:bg-foreground/5",
        "transition-colors duration-150",
        className,
      )}
    >
      {children}
    </button>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MessageActions({
  messageId,
  copiedId,
  isLastAssistant,
  onCopy,
  onRegenerate,
  onFeedback,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-0.5 pt-1.5 opacity-0 group-hover/assistant:opacity-100 transition-opacity duration-150">
      <ActionButton title="Copy" onClick={() => onCopy(messageId)}>
        {copiedId === messageId ? (
          <Check className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </ActionButton>

      {isLastAssistant && (
        <ActionButton title="Regenerate" onClick={onRegenerate}>
          <RotateCcw className="h-3.5 w-3.5" />
        </ActionButton>
      )}

      <div className="h-3.5 w-px bg-border mx-0.5" />

      <ActionButton title="Helpful" onClick={() => onFeedback("positive")}>
        <ThumbsUp className="h-3.5 w-3.5" />
      </ActionButton>

      <ActionButton title="Not helpful" onClick={() => onFeedback("negative")}>
        <ThumbsDown className="h-3.5 w-3.5" />
      </ActionButton>
    </div>
  )
}
