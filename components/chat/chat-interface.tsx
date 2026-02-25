"use client"

import { useState, useRef, useEffect } from "react"
import { WelcomeScreen } from "./welcome-screen"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Paperclip, 
  Globe, 
  Sparkles, 
  ArrowUp, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw, 
  Shield 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { chatWithSentinel } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  initialQuery?: string
  userName?: string
}

export function ChatInterface({ initialQuery, userName: propUserName = "User" }: ChatInterfaceProps) {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || propUserName
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
    }
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length])

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await chatWithSentinel({
        message: text,
        conversation_id: conversationId,
      })

      if (response.conversation_id) {
        setConversationId(response.conversation_id)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant", 
        content: response.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
    }
  }

  if (messages.length === 0 && !isLoading) {
    return <WelcomeScreen onSendMessage={handleSendMessage} userName={userName} />
  }

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto relative pl-4 lg:pl-8">
      <ScrollArea className="flex-1 w-full h-full">
        <div className="flex flex-col gap-8 py-8 px-4 w-full max-w-3xl mx-auto min-h-full pb-32">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full flex-col gap-2 group",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 px-1 opacity-80">
                  <div className="h-6 w-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80">Sentinel</span>
                </div>
              )}
              <div className={cn(
                "flex flex-col gap-1.5 max-w-[100%]", 
                message.role === "user" ? "items-end" : "items-start w-full"
              )}>
                <div className={cn(
                  "px-5 py-3.5 text-[15px] leading-relaxed",
                  message.role === "user"
                  ? "bg-[#2563eb] text-white rounded-2xl rounded-tr-sm max-w-[85%]" 
                  : "bg-transparent text-foreground px-0 py-0 w-full"
                )}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mt-2 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" title="Copy">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" title="Regenerate">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <div className="h-4 w-px bg-border/40 mx-1"></div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" title="Helpful">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" title="Not Helpful">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <div className="h-6 w-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20">
                  <Shield className="h-3.5 w-3.5 animate-pulse" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Sentinel is thinking...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 px-4 lg:px-6 pb-4 lg:pb-6 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="flex flex-col p-2">
              <textarea 
                ref={textareaRef}
                className="w-full bg-transparent px-4 py-3 text-[15px] placeholder:text-muted-foreground/50 focus:outline-none resize-none min-h-[50px] max-h-[200px] text-white"
                placeholder="Ask a follow up..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <div className="flex items-center justify-between px-2 pb-1.5 mt-1">
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/60">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/60">
                    <Globe className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-white/10 mx-1"></div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                    <Shield className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-[11px] font-medium text-muted-foreground">Sentinel Pro</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {input.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {input.length} / 2000
                    </span>
                  )}
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="h-9 w-9 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    onClick={() => handleSendMessage(input)}
                  >
                    <ArrowUp className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
