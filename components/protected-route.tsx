'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const userRole = (user as any)?.user_metadata?.role || 'employee'

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && allowedRoles && !allowedRoles.includes(userRole)) {
      router.push('/dashboard')
    }
  }, [user, loading, router, allowedRoles, userRole])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return null // Will redirect to dashboard
  }

  return <>{children}</>
}
