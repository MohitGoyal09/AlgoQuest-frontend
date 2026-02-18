"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Paperclip, Globe, Sparkles, ArrowUp, Mic, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void
  userName?: string
}

export function WelcomeScreen({ onSendMessage, userName = "User" }: WelcomeScreenProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const suggestionCards = [
    {
      icon: <Shield className="h-4 w-4 text-green-400" />,
      title: "Risk Analysis",
      description: "Check for burnout risks in the engineering team.",
      prompt: "Analyze the current burnout risk for the frontend team."
    },
    {
      icon: <Sparkles className="h-4 w-4 text-blue-400" />,
      title: "Velocity Check",
      description: "Review recent sprint velocity trends.",
      prompt: "How is the team's velocity trending over the last 3 sprints?"
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 lg:pl-8 w-full max-w-4xl mx-auto space-y-12 py-20">
      {/* Greeting Section */}
      <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative inline-block">
          <div className="h-20 w-20 mx-auto bg-[#1e1e20] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl mb-2 relative z-10 group">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Shield className="h-10 w-10 text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          </div>
        </div>
        
        <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Hello, <span className="text-emerald-400">{userName}</span>
            </h1>
            <p className="text-lg text-muted-foreground/60 font-medium">
            I'm Sentinel. How can I assist you with your team today?
            </p>
        </div>
      </div>

      {/* Main Input Area */}
      <div className="w-full max-w-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="relative bg-[#09090b]/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ring-1 ring-white/5 focus-within:ring-green-500/30 focus-within:border-green-500/30 group">
          <form onSubmit={handleSubmit} className="p-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about team health, risks, or performance..."
              className="w-full bg-transparent px-4 py-3 text-[15px] placeholder:text-muted-foreground/40 focus:outline-none resize-none min-h-[60px] max-h-[200px] text-white"
              onKeyDown={handleKeyDown}
              rows={1}
            />
            
            <div className="flex items-center justify-between px-2 pb-1.5 mt-2">
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/40 hover:text-white hover:bg-white/10 transition-colors">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/40 hover:text-white hover:bg-white/10 transition-colors">
                  <Globe className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/40 hover:text-white hover:bg-white/10 transition-colors">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-200 shadow-md",
                    input.trim() ? "bg-green-600 hover:bg-green-500 text-white hover:scale-105" : "bg-white/10 text-muted-foreground/40 hover:bg-white/20"
                  )}
                  disabled={!input.trim()}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Feature Cards / Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        {suggestionCards.map((card, index) => (
            <Card 
                key={index}
                onClick={() => onSendMessage(card.prompt)}
                className="group relative overflow-hidden bg-[#121214] border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer hover:bg-[#1a1a1c]"
            >
                <div className="p-5 flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                        {card.icon}
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">
                            {card.title}
                        </h3>
                        <p className="text-xs text-muted-foreground/60 leading-relaxed">
                            {card.description}
                        </p>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowUp className="h-3.5 w-3.5 text-muted-foreground rotate-45" />
                    </div>
                </div>
            </Card>
        ))}
      </div>
    </div>
  )
}
