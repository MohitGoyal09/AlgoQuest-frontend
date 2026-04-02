"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { WelcomeScreen } from "./welcome-screen"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  ArrowUp,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  MessageSquarePlus,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Brain,
  CheckCircle2,
  Loader2,
  TriangleAlert,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { chatWithSentinelStream, sendChatFeedback } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
  toolName?: string
  toolStatus?: "starting" | "processing" | "complete" | "error"
  toolArgs?: Record<string, unknown>
  toolResult?: string
}

interface ConversationItem {
  id: string
  title: string
  preview: string
  timestamp: Date
  messages: Message[]
}

interface ChatInterfaceProps {
  initialQuery?: string
  userName?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_INPUT_LENGTH = 2000

const QUICK_PROMPTS = [
  "Burnout risk summary",
  "At-risk team members",
  "Schedule check-ins",
  "Culture health",
  "Performance trends",
  "Engagement score",
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSuggestions(content: string): { cleanContent: string; suggestions: string[] } {
  const match = content.match(/<suggestions>\s*([\s\S]*?)\s*<\/suggestions>/)
  if (!match) return { cleanContent: content, suggestions: [] }

  const cleanContent = content.replace(/<suggestions>[\s\S]*?<\/suggestions>/, "").trim()
  const suggestions = match[1]
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, 3)

  return { cleanContent, suggestions }
}

function stripPartialSuggestions(content: string): string {
  let cleaned = content.replace(/<suggestions>[\s\S]*?<\/suggestions>/g, "")
  cleaned = cleaned.replace(/<suggestions>[\s\S]*$/, "")
  cleaned = cleaned.replace(/<suggest[^>]*$/, "")
  return cleaned.trim()
}

function formatTimeGroup(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays <= 7) return "This Week"
  return "Earlier"
}

function formatTimeChip(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function deriveTitleFromMessage(content: string): string {
  const trimmed = content.trim()
  if (trimmed.length <= 40) return trimmed
  return trimmed.slice(0, 38) + "…"
}

// ─── Sentinel Avatar ──────────────────────────────────────────────────────────

function SentinelAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="shrink-0 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold select-none"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      S
    </div>
  )
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 py-4 px-6 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-1 duration-200">
      <SentinelAvatar />
      <div className="flex items-center gap-1.5 pt-1">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 rounded-full bg-accent/70 dot-pulse"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Tool Card ───────────────────────────────────────────────────────────────

function formatToolName(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

interface ToolCardProps {
  message: Message
}

function ToolCard({ message }: ToolCardProps) {
  const [expanded, setExpanded] = useState(false)
  const status = message.toolStatus ?? "complete"
  const isActive = status === "starting" || status === "processing"

  return (
    <div className="flex w-full flex-col gap-1 py-2 px-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-1 duration-200">
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "relative overflow-hidden rounded-full border border-border p-1.5 flex items-center gap-3 w-fit max-w-xs transition-all duration-200 hover:border-border/80",
          isActive && "border-primary/30"
        )}
      >
        {/* Shimmer overlay when starting */}
        {status === "starting" && (
          <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          </div>
        )}

        {/* Left icon area */}
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {isActive ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : status === "error" ? (
            <TriangleAlert className="h-4 w-4 text-red-500" />
          ) : (
            <Wrench className="h-4 w-4 text-primary" />
          )}
        </div>

        {/* Tool name */}
        <span className="text-xs font-semibold text-muted-foreground pr-1">
          {formatToolName(message.toolName ?? "tool")}
        </span>

        {/* Right status icon */}
        <div className="pr-1.5 shrink-0">
          {status === "complete" ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : status === "error" ? (
            <TriangleAlert className="h-4 w-4 text-red-500" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-muted-foreground/50 animate-pulse" />
          )}
        </div>
      </button>

      {/* Expandable args/result panel */}
      {expanded && (message.toolArgs || message.toolResult) && (
        <div className="ml-6 mt-1 rounded-lg border border-border/50 bg-muted/50 p-3 text-xs font-mono text-muted-foreground overflow-x-auto animate-in fade-in slide-in-from-top-1 duration-150">
          {message.toolArgs && (
            <div className="mb-2">
              <span className="font-semibold text-foreground/70">Args:</span>
              <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(message.toolArgs, null, 2)}</pre>
            </div>
          )}
          {message.toolResult && (
            <div>
              <span className="font-semibold text-foreground/70">Result:</span>
              <pre className="mt-1 whitespace-pre-wrap">{message.toolResult}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Markdown Components ─────────────────────────────────────────────────────

const markdownComponents: Record<string, React.ComponentType<React.HTMLAttributes<HTMLElement> & { node?: unknown; children?: React.ReactNode; href?: string; src?: string; alt?: string; inline?: boolean }>> = {
  h1: ({ children, ...props }) => (
    <h1 className="text-base sm:text-lg font-bold mb-2 mt-3 text-black dark:text-white" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-sm sm:text-base font-semibold mb-2 mt-2" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xs sm:text-sm font-semibold mb-2 mt-2" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-xs sm:text-sm font-semibold mb-2 mt-2" {...props}>{children}</h4>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-2 text-[#374151] dark:text-foreground/90 leading-relaxed text-xs sm:text-sm" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc ml-6 space-y-1.5" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal ml-6 space-y-1.5" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-xs sm:text-sm text-[#374151] dark:text-foreground/90" {...props}>{children}</li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-black dark:text-white" {...props}>{children}</strong>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-primary pl-4 py-2 my-3 bg-gray-50 dark:bg-muted rounded-r text-sm" {...props}>{children}</blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-border/50">
      <table className="w-full text-xs sm:text-sm border-collapse" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-50 dark:bg-muted" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }) => (
    <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border/50" {...props}>{children}</th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-3 py-2 text-muted-foreground border-b border-border/30" {...props}>{children}</td>
  ),
  tr: ({ children, ...props }) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors" {...props}>{children}</tr>
  ),
  a: ({ children, href, ...props }) => (
    <a className="text-primary hover:underline" href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
  ),
  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="max-w-full rounded-xl shadow-sm border border-border" src={src} alt={alt ?? ""} {...props} />
  ),
  code: ({ inline, children, className, ...props }: { inline?: boolean; children?: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) => {
    if (inline) {
      return (
        <code className="bg-gray-100 dark:bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-red-600 dark:text-red-400" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => (
    <pre className="bg-gray-100 dark:bg-muted p-4 rounded-lg overflow-x-auto text-xs border border-border/50 my-3" {...props}>{children}</pre>
  ),
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message
  isLastAssistant: boolean
  isStreaming: boolean
  copiedId: string | null
  conversationId: string | undefined
  messageIndex: number
  onCopy: (content: string, id: string) => void
  onRegenerate: () => void
  onFeedback: (type: "positive" | "negative") => void
  onSuggestionClick: (text: string) => void
  isLoading: boolean
}

function MessageBubble({
  message,
  isLastAssistant,
  isStreaming,
  copiedId,
  conversationId,
  messageIndex,
  onCopy,
  onRegenerate,
  onFeedback,
  onSuggestionClick,
  isLoading,
}: MessageBubbleProps) {
  const isUser = message.role === "user"
  const showCursor = isStreaming && isLastAssistant && message.content.length > 0

  const displayContent =
    isStreaming && isLastAssistant
      ? stripPartialSuggestions(message.content)
      : message.content

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1 group py-4 px-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-1 duration-200",
        isUser ? "items-end" : "items-start"
      )}
    >
      {/* AI label row */}
      {!isUser && (
        <div className="flex items-center gap-2.5 mb-1">
          <SentinelAvatar />
          <span className="text-xs font-semibold text-foreground/60 tracking-wide uppercase">
            Sentinel
          </span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          isUser
            ? "bg-card border border-border rounded-2xl rounded-br-sm px-4 py-3 text-sm max-w-[70%] text-foreground"
            : "w-full text-sm leading-relaxed text-foreground/90"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{displayContent}</ReactMarkdown>
            {showCursor && (
              <span className="inline-block w-2 h-4 bg-accent/70 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
            )}
          </div>
        )}
      </div>

      {/* AI action row — copy, regen, thumbs */}
      {!isUser && !isStreaming && message.content.length > 0 && (
        <>
          <div className="flex items-center gap-1 mt-1.5 pl-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              title="Copy"
              onClick={() => onCopy(message.content, message.id)}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 active:scale-[0.97]"
            >
              {copiedId === message.id ? (
                <Check className="h-3.5 w-3.5 text-accent" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              title="Regenerate"
              onClick={onRegenerate}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 active:scale-[0.97]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <div className="h-4 w-px bg-border mx-1" />
            <button
              title="Helpful"
              onClick={() => onFeedback("positive")}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 active:scale-[0.97]"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              title="Not helpful"
              onClick={() => onFeedback("negative")}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all duration-150 active:scale-[0.97]"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Suggestion chips */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 pl-10">
              {message.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick(suggestion)}
                  disabled={isLoading}
                  className="bg-card/50 border border-border hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-0.5 rounded-full px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Conversation Sidebar ─────────────────────────────────────────────────────

interface ConversationSidebarProps {
  conversations: ConversationItem[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  collapsed: boolean
  onToggle: () => void
}

function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  collapsed,
  onToggle,
}: ConversationSidebarProps) {
  // Group conversations by date
  const groups: Record<string, ConversationItem[]> = {}
  for (const conv of conversations) {
    const group = formatTimeGroup(conv.timestamp)
    if (!groups[group]) groups[group] = []
    groups[group].push(conv)
  }
  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"]

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-0 overflow-hidden opacity-0 border-r-0" : "w-[280px]"
      )}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Brain className="h-5 w-5 text-accent dot-pulse" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">Copilot</span>
        </div>
        <button
          onClick={onToggle}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all duration-150"
          title="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat button */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-primary to-accent/80 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] hover:opacity-90"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
        {conversations.length === 0 && (
          <p className="text-xs text-muted-foreground/40 text-center pt-8 px-4">
            Your conversations will appear here
          </p>
        )}
        {groupOrder.map((group) => {
          const items = groups[group]
          if (!items || items.length === 0) return null
          return (
            <div key={group}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-2 pb-1.5 pt-2">
                {group}
              </p>
              <div className="space-y-0.5">
                {items.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-r-lg transition-all duration-150 group/item",
                      activeConversationId === conv.id
                        ? "bg-primary/[0.08] border-l-2 border-primary"
                        : "hover:bg-foreground/5 border-l-2 border-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "text-xs font-medium truncate leading-snug",
                          activeConversationId === conv.id
                            ? "text-foreground"
                            : "text-foreground/70 group-hover/item:text-foreground/90"
                        )}
                      >
                        {conv.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40 shrink-0 flex items-center gap-0.5 pt-px">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTimeChip(conv.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/40 truncate mt-0.5 leading-relaxed">
                      {conv.preview}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Chat Interface ──────────────────────────────────────────────────────

export function ChatInterface({ initialQuery, userName: propUserName = "User" }: ChatInterfaceProps) {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || propUserName

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  // ── Copy handler ──────────────────────────────────────────────────────────
  const handleCopy = useCallback(async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }, [])

  // ── New chat ──────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    setMessages([])
    setConversationId(undefined)
    setActiveConversationId(null)
    setInput("")
    setIsStreaming(false)
    setIsLoading(false)
    localStorage.removeItem("sentinel_chat_messages")
    localStorage.removeItem("sentinel_conversation_id")
  }, [])

  // ── Select conversation from sidebar ─────────────────────────────────────
  const handleSelectConversation = useCallback(
    (id: string) => {
      const conv = conversations.find((c) => c.id === id)
      if (!conv) return
      setMessages(conv.messages)
      setActiveConversationId(id)
      setConversationId(id)
      localStorage.setItem("sentinel_chat_messages", JSON.stringify(conv.messages))
      localStorage.setItem("sentinel_conversation_id", id)
    },
    [conversations]
  )

  // ── Persist conversation to sidebar list ──────────────────────────────────
  const persistConversation = useCallback(
    (msgs: Message[], convId: string) => {
      if (msgs.length < 2) return
      const firstUser = msgs.find((m) => m.role === "user")
      const firstAI = msgs.find((m) => m.role === "assistant")
      if (!firstUser) return

      const title = deriveTitleFromMessage(firstUser.content)
      const preview = firstAI?.content?.slice(0, 80) ?? ""

      setConversations((prev) => {
        const existing = prev.findIndex((c) => c.id === convId)
        const updated: ConversationItem = {
          id: convId,
          title,
          preview,
          timestamp: firstUser.timestamp,
          messages: msgs,
        }
        if (existing >= 0) {
          return prev.map((c, i) => (i === existing ? updated : c))
        }
        return [updated, ...prev]
      })
      setActiveConversationId(convId)
    },
    []
  )

  // ── Load persisted messages on mount ─────────────────────────────────────
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      try {
        const saved = localStorage.getItem("sentinel_chat_messages")
        const savedConvId = localStorage.getItem("sentinel_conversation_id")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const msgs = parsed.map((m: Message) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
            setMessages(msgs)
            if (savedConvId) {
              setConversationId(savedConvId)
              setActiveConversationId(savedConvId)
            }
          }
        }
      } catch {
        /* ignore corrupt storage */
      }
    }
  }, [])

  // ── Persist messages to localStorage ─────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("sentinel_chat_messages", JSON.stringify(messages))
      if (conversationId) {
        localStorage.setItem("sentinel_conversation_id", conversationId)
        persistConversation(messages, conversationId)
      }
    }
  }, [messages, conversationId, persistConversation])

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }, [input])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // ── Send initial query ────────────────────────────────────────────────────
  useEffect(() => {
    if (initialQuery && messages.length === 0 && initialized.current) {
      handleSendMessage(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    if (text.length > MAX_INPUT_LENGTH) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, aiMessage])
    setInput("")
    setIsLoading(true)
    setIsStreaming(true)

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      await chatWithSentinelStream(
        {
          message: text,
          conversation_id: conversationId,
          context: { conversation_history: history },
        },
        (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId ? { ...m, content: m.content + token } : m
            )
          )
        },
        (metadata) => {
          if (metadata.conversation_id) {
            setConversationId(metadata.conversation_id)
          }
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id === aiMessageId) {
                const { cleanContent, suggestions } = parseSuggestions(m.content)
                return { ...m, content: cleanContent, suggestions }
              }
              return m
            })
          )
          setIsLoading(false)
          setIsStreaming(false)
        },
        () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId
                ? { ...m, content: "Sorry, I encountered an error. Please try again." }
                : m
            )
          )
          setIsLoading(false)
          setIsStreaming(false)
        }
      )
    } catch {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
    }
  }

  // ── Welcome screen ────────────────────────────────────────────────────────
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full w-full bg-background">
        {/* Sidebar on welcome too */}
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />

        {/* Collapsed sidebar toggle */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-5 bg-sidebar border border-sidebar-border border-l-0 rounded-r-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-all duration-150"
            title="Expand sidebar"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}

        <WelcomeScreen
          onSendMessage={handleSendMessage}
          userName={userName}
        />
      </div>
    )
  }

  // ── Derive conversation title ─────────────────────────────────────────────
  const convTitle =
    messages.find((m) => m.role === "user")
      ? deriveTitleFromMessage(messages.find((m) => m.role === "user")!.content)
      : "New conversation"

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* ── ZONE 1: Conversation sidebar ────────────────────────────────── */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* ── ZONE 2 + 3: Chat area + Input ───────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Collapsed sidebar toggle */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-5 bg-sidebar border border-sidebar-border border-l-0 rounded-r-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-all duration-150"
            title="Expand sidebar"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
          <h2 className="font-bold text-sm text-foreground truncate max-w-md" style={{ fontFamily: "Manrope, var(--font-sans, sans-serif)" }}>
            {convTitle}
          </h2>
          <div className="flex items-center gap-1">
            <button
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all duration-150"
              title="Share conversation"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all duration-150"
              title="Export conversation"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages scroll area */}
        <ScrollArea className="flex-1 w-full bg-background">
          <div className="flex flex-col pb-6">
            {messages.map((message, idx) =>
              message.toolName ? (
                <ToolCard key={message.id} message={message} />
              ) : (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLastAssistant={message.id === lastAssistantId}
                  isStreaming={isStreaming}
                  copiedId={copiedId}
                  conversationId={conversationId}
                  messageIndex={idx}
                  onCopy={handleCopy}
                  onRegenerate={() => {
                    const prevUserMsg = messages[idx - 1]
                    if (prevUserMsg) handleSendMessage(prevUserMsg.content)
                  }}
                  onFeedback={(type) => {
                    if (conversationId) {
                      sendChatFeedback(conversationId, idx, type).catch(() => {})
                    }
                  }}
                  onSuggestionClick={handleSendMessage}
                  isLoading={isLoading}
                />
              )
            )}

            {/* Typing indicator — only before first token arrives */}
            {isLoading &&
              (!isStreaming || messages[messages.length - 1]?.content === "") && (
                <TypingIndicator />
              )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* ── ZONE 3: Input area ────────────────────────────────────────── */}
        <div className="shrink-0 bg-background/90 backdrop-blur-xl border-t border-border px-6 py-4">
          {/* Quick prompt chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="bg-card/60 border border-border hover:border-primary/30 rounded-full px-3 py-1.5 text-xs whitespace-nowrap text-muted-foreground hover:text-foreground hover:-translate-y-0.5 transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input wrapper */}
          <div className="bg-card border border-border/50 rounded-2xl flex items-end gap-2 p-3 focus-within:border-primary/40 transition-all duration-200">
            <textarea
              ref={textareaRef}
              className="bg-transparent resize-none text-sm placeholder:text-muted-foreground/50 flex-1 focus:outline-none min-h-[24px] max-h-[200px] text-foreground leading-relaxed transition-all duration-150"
              placeholder="Ask a follow up…"
              value={input}
              onChange={(e) => {
                const val = e.target.value
                if (val.length <= MAX_INPUT_LENGTH) setInput(val)
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={MAX_INPUT_LENGTH}
            />

            <div className="flex items-center gap-2 shrink-0">
              {input.length > 0 && (
                <span
                  className={cn(
                    "text-[10px] transition-colors tabular-nums",
                    input.length > MAX_INPUT_LENGTH * 0.9
                      ? "text-amber-500 font-medium"
                      : input.length === MAX_INPUT_LENGTH
                        ? "text-red-500 font-semibold"
                        : "text-muted-foreground/40"
                  )}
                >
                  {input.length}/{MAX_INPUT_LENGTH}
                </span>
              )}

              <button
                disabled={!input.trim() || isLoading || input.length > MAX_INPUT_LENGTH}
                onClick={() => handleSendMessage(input)}
                className={cn(
                  "bg-primary hover:bg-primary/80 text-white rounded-xl p-2 transition-all duration-150 active:scale-[0.97]",
                  (!input.trim() || isLoading || input.length > MAX_INPUT_LENGTH) &&
                    "opacity-40 cursor-not-allowed"
                )}
                title="Send message"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
