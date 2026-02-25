"use client"

import { useEffect, use } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"

interface AskSentinelPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function AskSentinelPage({ searchParams }: AskSentinelPageProps) {
  const params = use(searchParams)
  const query = typeof params.q === "string" ? params.q : undefined

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-background">
      <div className="flex-1 flex flex-col">
        <ChatInterface initialQuery={query} />
      </div>
    </div>
  )
}
