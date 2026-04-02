"use client"

import { use, Suspense } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ProtectedRoute } from "@/components/protected-route"

interface AskSentinelPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function AskSentinelContent({ searchParams }: AskSentinelPageProps) {
  const params = use(searchParams)
  const query = typeof params.q === "string" ? params.q : undefined

  return (
    <div className="flex h-screen bg-background">
      <ChatInterface initialQuery={query} />
    </div>
  )
}

export default function AskSentinelPage({ searchParams }: AskSentinelPageProps) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="flex h-screen bg-background" />}>
        <AskSentinelContent searchParams={searchParams} />
      </Suspense>
    </ProtectedRoute>
  )
}
