'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()

  const role = userRole?.role ?? null

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && !role) {
      // Role fetch failed or user has no role — redirect to login
      router.push('/login')
    }
    if (!loading && user && allowedRoles && role && !allowedRoles.includes(role)) {
      router.push('/dashboard')
    }
  }, [user, userRole, loading, router, allowedRoles, role])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || role === null) {
    return null // Will redirect via useEffect above
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null // Will redirect to dashboard
  }

  return <>{children}</>
}
