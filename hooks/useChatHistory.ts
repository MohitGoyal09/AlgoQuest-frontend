"use client"

import { useState, useEffect, useCallback } from 'react'
import { listChatSessions, ChatSessionSummary } from '@/lib/api'

export type { ChatSessionSummary }

/**
 * Custom event name dispatched when a chat session is created or updated.
 * Listeners (e.g. sidebar) should call `refetch()` on receiving this event.
 */
export const CHAT_SESSION_CHANGED_EVENT = 'sentinel:chat-session-changed'

/**
 * Dispatch a notification that the session list has changed.
 * Call this from ChatInterface after a new session is created or messages are sent.
 */
export function notifyChatSessionChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHAT_SESSION_CHANGED_EVENT))
  }
}

export interface UseChatHistoryOptions {
  limit?: number
  enabled?: boolean
}

export function useChatHistory(options: UseChatHistoryOptions = {}) {
  const { limit = 20, enabled = true } = options
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    if (!enabled) return
    try {
      setIsLoading(true)
      const data = await listChatSessions(limit)
      setSessions(data.sessions || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }, [limit, enabled])

  // Initial fetch
  useEffect(() => { fetchSessions() }, [fetchSessions])

  // Listen for session-changed events to auto-refresh the sidebar list.
  // Uses a short debounce to coalesce rapid events (e.g. stream done + auto-title).
  useEffect(() => {
    if (!enabled) return

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const handler = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => { fetchSessions() }, 300)
    }

    window.addEventListener(CHAT_SESSION_CHANGED_EVENT, handler)
    return () => {
      window.removeEventListener(CHAT_SESSION_CHANGED_EVENT, handler)
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [enabled, fetchSessions])

  return { sessions, isLoading, error, refetch: fetchSessions }
}
