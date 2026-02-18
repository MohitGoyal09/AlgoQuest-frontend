"use client"

import { useState, useEffect, useCallback } from "react"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "ask-sentinel-chats"

function getStoredChats(): Chat[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveChats(chats: Chat[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch (e) {
    console.error("Failed to save chats:", e)
  }
}

export function useChatHistory() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredChats()
    setChats(stored)
    if (stored.length > 0) {
      const sorted = [...stored].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      setCurrentChatId(sorted[0].id)
    }
    setIsLoading(false)
  }, [])

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newChat, ...chats]
    setChats(updated)
    setCurrentChatId(newChat.id)
    saveChats(updated)
    return newChat
  }, [chats])

  const loadChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId)
  }, [])

  const updateCurrentChat = useCallback(
    (messages: ChatMessage[], title?: string) => {
      if (!currentChatId) return

      setChats((prev) => {
        const existingChat = prev.find((c) => c.id === currentChatId)
        
        const newTitle =
          title ||
          (existingChat?.title === "New Chat"
            ? messages.length > 0 && messages[0].role === "user"
              ? messages[0].content.slice(0, 40) +
                (messages[0].content.length > 40 ? "..." : "")
              : "New Chat"
            : existingChat?.title) ||
          "New Chat"

        const updated = prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              title: newTitle,
              messages,
              updatedAt: new Date().toISOString(),
            }
          }
          return chat
        })
        
        if (!existingChat) {
          const newChat: Chat = {
            id: currentChatId,
            title: newTitle,
            messages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          updated.unshift(newChat)
        }
        
        saveChats(updated)
        return updated
      })
    },
    [currentChatId]
  )

  const deleteChat = useCallback((chatId: string) => {
    setChats((prev) => {
      const updated = prev.filter((c) => c.id !== chatId)
      saveChats(updated)
      if (currentChatId === chatId) {
        setCurrentChatId(updated.length > 0 ? updated[0].id : null)
      }
      return updated
    })
  }, [currentChatId])

  const currentChat = chats.find((c) => c.id === currentChatId) || null

  return {
    chats,
    currentChat,
    currentChatId,
    isLoading,
    createNewChat,
    loadChat,
    updateCurrentChat,
    deleteChat,
  }
}
