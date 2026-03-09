'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'

// Module-scope singleton — prevents infinite re-renders from useEffect [supabase] dependency
const supabase = createClient()
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { MeResponse } from '@/types'

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
      const response = await api.get<MeResponse>('/me')

      if (response && response.user) {
        setUserRole(response.user as UserRole)
        localStorage.setItem('userRole', response.user.role)
      } else {
        setUserRole(null)
      }
    } catch (error) {
      setUserRole(null)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) {
        fetchUserRole()
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session) {
          fetchUserRole()
        } else {
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Fetch user role to determine redirect
    try {
      const roleResponse = await api.get<MeResponse>('/me')

      const userData = roleResponse?.user
      
      // Store role in localStorage for middleware to access
      if (userData?.role) {
        localStorage.setItem('userRole', userData.role)
      }
      
      // Redirect to ask-sentinel - it will show content based on role
      router.push('/ask-sentinel')
    } catch (error) {
      // Fallback to ask-sentinel if role fetch fails
      router.push('/ask-sentinel')
    }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    // Supabase sends confirmation email by default
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
