"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Sparkles, ArrowRight, Bot, Search, AlertCircle, Clock, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AskSentinelWidgetProps {
  userRole?: "manager" | "employee" | "admin"
  className?: string
}

const SUGGESTED_QUESTIONS = {
  manager: [
    { label: "Who is at risk?", icon: AlertCircle },
    { label: "Who works late?", icon: Clock },
    { label: "Team health summary", icon: Users },
  ],
  employee: [
    { label: "How am I doing?", icon: AlertCircle },
    { label: "My work patterns", icon: Clock },
    { label: "Stress insights", icon: Users },
  ],
  admin: [
    { label: "System status", icon: AlertCircle },
    { label: "User analytics", icon: Users },
    { label: "Recent alerts", icon: Clock },
  ],
}

export function AskSentinelWidget({ userRole = "manager", className }: AskSentinelWidgetProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const suggestions = SUGGESTED_QUESTIONS[userRole] || SUGGESTED_QUESTIONS.manager

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/ask-sentinel?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/ask-sentinel?q=${encodeURIComponent(suggestion)}`)
  }

  const handleOpenFullChat = () => {
    router.push("/ask-sentinel")
  }

  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shadow-md">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Ask Sentinel
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                AI-powered team insights
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold bg-purple-500/10 text-purple-500 border-purple-500/20">
            <Sparkles className="mr-1 h-3 w-3" />
            AI
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Welcome Message */}
        <div className="rounded-lg bg-purple-500/5 p-3 border border-purple-500/10">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Hello!</span> I can help you understand team patterns, 
            identify risks, and get insights about work habits. What would you like to know?
          </p>
        </div>

        {/* Quick Input */}
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "pl-9 pr-10 h-9 text-xs bg-muted/30 border-muted transition-all",
              isFocused && "border-purple-500/30 ring-1 ring-purple-500/20"
            )}
          />
          {query && (
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </form>

        {/* Suggested Questions */}
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Quick questions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion.label)}
                className="h-7 px-2.5 text-[11px] rounded-full border-muted bg-muted/30 hover:bg-muted hover:border-purple-500/30 transition-colors"
              >
                <suggestion.icon className="mr-1.5 h-3 w-3 text-muted-foreground" />
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenFullChat}
          className="w-full h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-1.5"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Open full chat
          <ArrowRight className="h-3 w-3 ml-auto" />
        </Button>
      </CardFooter>
    </Card>
  )
}
