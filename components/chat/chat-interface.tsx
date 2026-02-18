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
  Mic, 
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

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

interface ChatInterfaceProps {
  initialQuery?: string
  userName?: string
  chat?: Chat | null
  onChatUpdate?: (messages: Message[], title?: string) => void
}

export function ChatInterface({ initialQuery, userName: propUserName = "User", chat, onChatUpdate }: ChatInterfaceProps) {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || propUserName
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (chat?.messages && chat.messages.length > 0) {
      setMessages(
        chat.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
      )
    } else {
      setMessages([])
    }
  }, [chat?.id])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery)
    }
  }, [initialQuery])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      if (onChatUpdate) {
        const messagesToSave = [...messages, userMessage].map((m) => ({
          ...m,
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
        }))
        onChatUpdate(messagesToSave)
      }

      try {
      const response = await chatWithSentinel({
        message: text,
        conversation_id: conversationId,
      })

      if (response.conversation_id) {
        setConversationId(response.conversation_id)
      }

      const aiMessage: Message = {
        id: response.conversation_id || (Date.now() + 1).toString(),
        role: "assistant", 
        content: response.response,
        timestamp: new Date()
      }
      const updatedMessages = [...messages, userMessage, aiMessage]
      setMessages(updatedMessages)
      if (onChatUpdate) {
        const messagesToSave = updatedMessages.map((m) => ({
          ...m,
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
        }))
        onChatUpdate(messagesToSave)
      }
    } catch (error) {
       console.error("Chat error:", error)
       const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting to the server. Please check your connection and try again.",
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
       
      {/* Chat Area */}
      <ScrollArea className="flex-1 w-full h-full">
         <div className="flex flex-col gap-8 py-8 px-4 w-full max-w-3xl mx-auto min-h-full pb-32">
            {messages.map((message, index) => (
               <div
                  key={message.id}
                  className={cn(
                    "flex w-full flex-col gap-2 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
               >
                  {/* Message Header (Sentinel only) */}
                  {message.role === "assistant" && (
                     <div className="flex items-center gap-2 px-1 opacity-80">
                        <div className="h-6 w-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20 shadow-sm shadow-green-500/5">
                            <Shield className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium text-foreground/80">Sentinel</span>
                     </div>
                  )}

                  {/* Message Content */}
                  <div className={cn(
                      "flex flex-col gap-1.5 max-w-[100%]", 
                      message.role === "user" ? "items-end" : "items-start w-full"
                  )}>
                      <div
                        className={cn(
                            "px-5 py-3.5 text-[15px] leading-relaxed shadow-sm",
                            message.role === "user"
                            ? "bg-[#2563eb] text-white rounded-2xl rounded-tr-sm max-w-[85%]" 
                            : "bg-transparent text-foreground px-0 py-0 w-full"
                        )}
                      >
                         <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      
                      {/* Actions for Assistant */}
                      {message.role === "assistant" && (
                          <div className="flex items-center gap-2 mt-2 pl-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-md" title="Copy">
                                   <Copy className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-md" title="Regenerate">
                                   <RotateCcw className="h-4 w-4" />
                               </Button>
                               <div className="h-4 w-px bg-border/40 mx-1"></div>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-md" title="Helpful">
                                   <ThumbsUp className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-md" title="Not Helpful">
                                   <ThumbsDown className="h-4 w-4" />
                               </Button>
                          </div>
                      )}
                  </div>
               </div>
            ))}

            {/* Loading State */}
            {isLoading && (
                 <div className="flex w-full flex-col gap-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-6 w-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20 shadow-sm shadow-green-500/5">
                            <Shield className="h-3.5 w-3.5 animate-pulse" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Sentinel is thinking...</span>
                    </div>
                 </div>
            )}
            <div ref={scrollRef} />
         </div>
      </ScrollArea>

      {/* Input Area (Floating at bottom) */}
      <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 px-4 lg:px-6 pb-4 lg:pb-6 z-40">
        <div className="max-w-4xl mx-auto">
           <div className="relative bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 ring-1 ring-white/5 focus-within:ring-green-500/30 focus-within:border-green-500/30">
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
                             <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/60 hover:text-white hover:bg-white/10 transition-colors">
                                 <Paperclip className="h-4 w-4" />
                             </Button>
                             <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground/60 hover:text-white hover:bg-white/10 transition-colors">
                                 <Globe className="h-4 w-4" />
                             </Button>
                             
                             <div className="h-4 w-px bg-white/10 mx-1"></div>
                             
                             <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors cursor-pointer group">
                                <Shield className="h-3.5 w-3.5 text-green-400 group-hover:text-green-300" />
                                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-white transition-colors">Sentinel Pro</span>
                             </div>
                         </div>
                         
                         <div className="flex items-center gap-2">
                             {input.length > 0 && (
                                 <span className="text-[10px] text-muted-foreground animate-in fade-in">
                                     {input.length} / 2000
                                 </span>
                             )}
                              <Button 
                                type="submit" 
                                size="icon"
                                onClick={() => handleSendMessage(input)}
                                disabled={!input.trim() || isLoading}
                                className={cn(
                                    "h-8 w-8 rounded-full transition-all duration-200 shadow-md", 
                                    input.trim() 
                                        ? "bg-green-600 text-white hover:bg-green-500 hover:scale-105" 
                                        : "bg-white/10 text-muted-foreground/40 hover:bg-white/20"
                                )}
                              >
                                 <ArrowUp className="h-4 w-4" />
                             </Button>
                         </div>
                    </div>
                </div>
           </div>
           
           <div className="text-center mt-3">
              <p className="text-[10px] text-muted-foreground/40 font-medium tracking-tight">
                 Sentinel AI can make mistakes. Please verify important information.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
