"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowUp, Users, AlertTriangle, CalendarCheck, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_INPUT_LENGTH = 2000

const SUGGESTION_CARDS = [
  {
    icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    title: "Burnout Risk Summary",
    description: "Surface who's approaching overload before it becomes a problem.",
    prompt: "Analyze the current burnout risk for the engineering team.",
  },
  {
    icon: <Users className="h-4 w-4 text-red-400" />,
    title: "At-Risk Team Members",
    description: "Identify employees who may need attention or support right now.",
    prompt: "Who are the at-risk team members this month and why?",
  },
  {
    icon: <CalendarCheck className="h-4 w-4 text-primary" />,
    title: "Schedule Check-ins",
    description: "Recommend who should receive a 1:1 check-in this week.",
    prompt: "Which employees should I prioritize for check-ins this week?",
  },
  {
    icon: <Heart className="h-4 w-4 text-teal-400" />,
    title: "Culture Health",
    description: "Get a pulse on team morale, collaboration, and culture signals.",
    prompt: "Give me a culture health overview for the organization.",
  },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void
  userName?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WelcomeScreen({ onSendMessage, userName = "User" }: WelcomeScreenProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) onSendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) onSendMessage(input)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto bg-background">
      <div className="w-full max-w-2xl flex flex-col items-center gap-10">

        {/* ── Hero section ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in-95 duration-500">
          {/* Sentinel "S" logo with ambient glow */}
          <div className="relative">
            {/* Animated glow halo */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-accent/25 blur-3xl scale-[2] pointer-events-none animate-pulse-subtle"
              aria-hidden="true"
            />
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl ring-1 ring-primary/20">
              <span
                className="text-3xl font-black text-white select-none"
                style={{ fontFamily: "Manrope, var(--font-sans, sans-serif)" }}
              >
                S
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "Manrope, var(--font-sans, sans-serif)" }}
            >
              Hi{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {userName}
              </span>
              , how can I help?
            </h1>
            <p className="text-sm text-muted-foreground/60 max-w-md mx-auto leading-relaxed">
              Ask anything about your team&apos;s health, performance, and wellbeing.
            </p>
          </div>
        </div>

        {/* ── Input box ────────────────────────────────────────────────── */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          <form onSubmit={handleSubmit}>
            <div className="bg-card border border-white/10 rounded-2xl flex items-end gap-2 p-3 focus-within:border-primary/50 transition-all duration-200 shadow-xl">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  const val = e.target.value
                  if (val.length <= MAX_INPUT_LENGTH) setInput(val)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about team health, burnout risks, or performance…"
                className="bg-transparent resize-none text-sm placeholder:text-muted-foreground/40 flex-1 focus:outline-none min-h-[36px] max-h-[200px] text-foreground leading-relaxed transition-all duration-150"
                rows={1}
                maxLength={MAX_INPUT_LENGTH}
              />

              <button
                type="submit"
                disabled={!input.trim()}
                className={cn(
                  "bg-primary hover:bg-primary/80 text-white rounded-xl p-2 transition-all duration-150 active:scale-[0.97] shrink-0",
                  !input.trim() && "opacity-40 cursor-not-allowed"
                )}
                title="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* ── Suggestion cards 2×2 grid ────────────────────────────────── */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
          {SUGGESTION_CARDS.map((card, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(card.prompt)}
              className="group text-left bg-card/50 border border-white/5 hover:border-primary/30 hover:bg-primary/5 rounded-xl p-4 cursor-pointer transition-all duration-150 active:scale-[0.97] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                  {card.icon}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/50 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Footer hint ──────────────────────────────────────────────── */}
        <p className="text-[11px] text-muted-foreground/30 text-center animate-in fade-in duration-700 delay-300">
          Sentinel uses your organization&apos;s data · Press{" "}
          <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          to send
        </p>
      </div>
    </div>
  )
}
