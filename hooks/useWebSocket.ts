"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws"
const PING_INTERVAL_MS = 25000
const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECT_ATTEMPTS = 5

export interface WSMessage {
  type: "risk_update" | "team_alert" | "manual_refresh" | "pong" | "sync_complete"
  user_hash?: string
  timestamp?: string
  data?: Record<string, unknown>
  risk_level?: string
  velocity?: number
  anonymous_id?: string
}

interface UseWebSocketOptions {
  /** "personal" connects to /ws/{user_hash}, "admin" to /ws/admin/team */
  channel?: "personal" | "admin"
  /** Called on every incoming message (except pong) */
  onMessage?: (msg: WSMessage) => void
  /** Auto-connect on mount. Default true */
  enabled?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { channel = "personal", onMessage, enabled = true } = options
  const { session, userRole } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectCountRef = useRef(0)
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  const connect = useCallback(() => {
    const token = session?.access_token
    const userHash = userRole?.user_hash
    if (!token || !enabled) return

    // Build URL based on channel
    let url: string
    if (channel === "admin") {
      url = `${WS_URL}/admin/team?token=${token}`
    } else {
      if (!userHash) return
      url = `${WS_URL}/${userHash}?token=${token}`
    }

    // Don't reconnect if already open
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      reconnectCountRef.current = 0
      // Start ping interval
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: "ping" }))
        }
      }, PING_INTERVAL_MS)
    }

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        if (msg.type === "pong") return
        setLastMessage(msg)
        onMessageRef.current?.(msg)
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      setConnected(false)
      if (pingRef.current) clearInterval(pingRef.current)
      // Auto-reconnect
      if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS && enabled) {
        reconnectCountRef.current++
        setTimeout(connect, RECONNECT_DELAY_MS)
      }
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [session?.access_token, userRole?.user_hash, channel, enabled])

  // Connect on mount / deps change
  useEffect(() => {
    if (!enabled) return
    connect()
    return () => {
      if (pingRef.current) clearInterval(pingRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null // prevent reconnect on intentional close
        wsRef.current.close()
      }
    }
  }, [connect, enabled])

  const requestUpdate = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "request_update" }))
    }
  }, [])

  return { connected, lastMessage, requestUpdate }
}
