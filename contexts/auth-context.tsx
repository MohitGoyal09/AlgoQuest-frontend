'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'

// Module-scope singleton — prevents infinite re-renders from useEffect [supabase] dependency
const supabase = createClient()
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface UserRole {
  user_hash: string
  role: 'employee' | 'manager' | 'admin'
  consent_share_with_manager: boolean
  consent_share_anonymized: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // supabase is at module scope (singleton)

  // Fetch user role from backend
  const fetchUserRole = async () => {
    try {
      const raw = await api.get<any>('/auth/me')
      const response = raw?.data ?? raw

      if (response && response.role) {
        setUserRole({
          user_hash: response.user_hash,
          role: response.role,
          consent_share_with_manager: response.consent_share_with_manager ?? false,
          consent_share_anonymized: response.consent_share_anonymized ?? true,
        } as UserRole)
      } else {
        setUserRole(null)
      }
    } catch (error) {
      setUserRole(null)
    }
  }

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION synchronously on mount,
    // so a separate getSession() call is unnecessary and causes a double-fetch race.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(prev => {
          // Only update if the access_token actually changed — prevents
          // downstream re-renders (TenantContext) on identical sessions.
          if (prev?.access_token === session?.access_token) return prev
          return session
        })
        setUser(session?.user ?? null)
        if (session) {
          await fetchUserRole()
        } else {
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const errorMap: Record<string, string> = {
        'Invalid login credentials': 'Invalid email or password. Please try again.',
        'Email not confirmed': 'Please verify your email before signing in.',
        'Too many requests': 'Too many login attempts. Please wait a few minutes.',
      }
      throw new Error(errorMap[error.message] || error.message)
    }
    // onAuthStateChange listener will fire, calling fetchUserRole() and setting state
    router.push('/dashboard')
  }

  const signUp = async (email: string, password: string) => {
    try {
      const raw = await api.post<any>('/auth/register', { email, password })
      const result = raw?.data ?? raw

      if (!result?.access_token) {
        throw new Error('Registration failed. Please try again.')
      }

      // Set the Supabase session from backend tokens
      await supabase.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      })

      router.push('/dashboard')
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Registration failed. Please try again.')
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
