"use client"

import { useEffect, use } from "react"
import { useChatHistory } from "@/hooks/useChatHistory"
import { ChatInterface } from "@/components/chat/chat-interface"

interface AskSentinelPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function AskSentinelPage({ searchParams }: AskSentinelPageProps) {
  const params = use(searchParams)
  const query = typeof params.q === "string" ? params.q : undefined
  const chatIdParam = typeof params.chatId === "string" ? params.chatId : undefined
  
  const {
    chats,
    currentChat,
    isLoading,
    loadChat,
    createNewChat,
    updateCurrentChat,
  } = useChatHistory()

  useEffect(() => {
    if (chatIdParam) {
      loadChat(chatIdParam)
    } else if (!isLoading && !currentChat && chats.length === 0) {
      createNewChat()
    }
  }, [chatIdParam, isLoading, chats.length, currentChat, loadChat, createNewChat])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-background">
      <div className="flex-1 flex flex-col">
        <ChatInterface
          initialQuery={query}
          chat={currentChat}
          onChatUpdate={updateCurrentChat}
        />
      </div>
    </div>
  )
}
