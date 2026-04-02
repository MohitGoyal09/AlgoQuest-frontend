"use client"

import { ProtectedRoute } from "@/components/protected-route"

export default function EnginesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["manager", "admin"]}>
      {children}
    </ProtectedRoute>
  )
}
