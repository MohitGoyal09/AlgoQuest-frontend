/**
 * Server-side authentication utilities for Next.js Server Components and API Routes
 *
 * SECURITY MODEL:
 * ================================================================================
 * These utilities perform VERIFIED role checks by calling the backend API with
 * the JWT token. The backend validates JWT signatures via Supabase and returns
 * the user's actual database role.
 *
 * NEVER use client-side JWT decoding for authorization - it can be forged.
 * Always use these server-side utilities for role-based access control.
 * ================================================================================
 */

import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface VerifiedUser {
  user_hash: string
  email: string
  role: 'employee' | 'manager' | 'admin'
  tenant_id?: string
}

/**
 * Extract access token from Supabase cookies (server-side)
 * Mirrors the logic in middleware.ts but runs in server context
 */
async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Find Supabase auth cookie
  const authCookie = allCookies.find(
    (cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  )

  if (authCookie?.value) {
    let rawValue = authCookie.value

    // Handle Supabase Auth Helpers "base64-" prefix
    if (rawValue.startsWith('base64-')) {
      try {
        const base64Part = rawValue.replace('base64-', '')
        rawValue = atob(base64Part)
      } catch (e) {
        console.warn('Failed to decode base64 cookie prefix', e)
      }
    }

    try {
      // Decode URI if needed and parse JSON
      const decodedVal = decodeURIComponent(rawValue)
      const data = JSON.parse(decodedVal)

      if (data.access_token) {
        return data.access_token
      }

      // Handle array format (common in some Supabase versions)
      if (Array.isArray(data)) {
        for (const item of data) {
          if (typeof item === 'object' && item?.access_token) {
            return item.access_token
          }
        }
      }
    } catch {
      // If parsing fails, check if the value itself is a JWT
      if (rawValue.startsWith('ey')) {
        return rawValue
      }
    }
  }

  // Fall back to legacy cookie
  const legacyToken = cookieStore.get('sb-access-token')?.value
  if (legacyToken && legacyToken.startsWith('ey')) {
    return legacyToken
  }

  return null
}

/**
 * Get the current authenticated user with VERIFIED role from backend
 *
 * This function calls the backend /auth/me endpoint which:
 * 1. Validates JWT signature via Supabase
 * 2. Fetches user's actual role from database
 * 3. Returns verified user identity
 *
 * Use this in Server Components and API Routes for role-based access control.
 *
 * @returns VerifiedUser object or null if not authenticated
 *
 * @example
 * ```tsx
 * // In a Server Component
 * export default async function AdminPage() {
 *   const user = await getVerifiedUser()
 *
 *   if (!user) {
 *     redirect('/login')
 *   }
 *
 *   if (user.role !== 'admin') {
 *     return <div>Access denied - Admin only</div>
 *   }
 *
 *   return <AdminDashboard user={user} />
 * }
 * ```
 */
export async function getVerifiedUser(): Promise<VerifiedUser | null> {
  const token = await getAccessTokenFromCookies()

  if (!token) {
    return null
  }

  try {
    // Call backend /auth/me endpoint which validates JWT and returns verified user
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache auth checks
    })

    if (!response.ok) {
      console.warn('Auth verification failed:', response.status)
      return null
    }

    const data = await response.json()

    return {
      user_hash: data.user_hash || data.id,
      email: data.email,
      role: data.role || 'employee',
      tenant_id: data.tenant_id,
    }
  } catch (error) {
    console.error('Error verifying user:', error)
    return null
  }
}

/**
 * Require specific role(s) - throws error if user doesn't have required role
 *
 * Use this to enforce role-based access control in Server Components.
 *
 * @param allowedRoles - Array of allowed roles
 * @returns VerifiedUser object
 * @throws Error if user is not authenticated or doesn't have required role
 *
 * @example
 * ```tsx
 * export default async function ManagerPage() {
 *   const user = await requireRole(['manager', 'admin'])
 *   // User is guaranteed to be manager or admin here
 *   return <ManagerDashboard user={user} />
 * }
 * ```
 */
export async function requireRole(
  allowedRoles: Array<'employee' | 'manager' | 'admin'>
): Promise<VerifiedUser> {
  const user = await getVerifiedUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Access denied. Required roles: ${allowedRoles.join(', ')}. User role: ${user.role}`
    )
  }

  return user
}

/**
 * Check if current user has specific role (without throwing error)
 *
 * @param role - Role to check
 * @returns true if user has the role, false otherwise
 *
 * @example
 * ```tsx
 * export default async function Dashboard() {
 *   const isAdmin = await hasRole('admin')
 *   return (
 *     <div>
 *       <h1>Dashboard</h1>
 *       {isAdmin && <AdminPanel />}
 *     </div>
 *   )
 * }
 * ```
 */
export async function hasRole(role: 'employee' | 'manager' | 'admin'): Promise<boolean> {
  const user = await getVerifiedUser()
  return user?.role === role
}
