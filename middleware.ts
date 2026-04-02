import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

/**
 * Authentication middleware with SECURE role handling
 *
 * SECURITY MODEL:
 * ================================================================================
 * ⚠️  CLIENT-SIDE JWT DECODING IS NOT AUTHORIZATION ⚠️
 *
 * This middleware previously decoded JWTs client-side to extract roles for routing.
 * This is INSECURE because JWTs can be forged without signature verification.
 *
 * FIXED APPROACH:
 * - Middleware only validates authentication (token presence via Supabase)
 * - ALL authenticated users can access protected routes (UI-level only)
 * - Server components and API routes perform REAL authorization via backend
 * - Backend validates JWT signatures using supabase.auth.get_user(token)
 * - Role-based UI rendering happens server-side with verified tokens
 *
 * DEFENSE IN DEPTH:
 * - Layer 1 (Middleware): Authentication check only - "are you logged in?"
 * - Layer 2 (Server Components): Fetch user role from backend API with verified JWT
 * - Layer 3 (Backend API): Full JWT signature verification + database role check
 * - Layer 4 (Backend API): RBAC enforcement via require_role() dependency
 *
 * Cookie Name Note:
 * Supabase Auth uses project-specific cookie names: sb-{project_ref}-auth-token
 * The cookie contains a JSON object with access_token, refresh_token, etc.
 * ================================================================================
 */

// Paths that redirect to dashboard when user is authenticated
const ROLE_BASED_PATHS = ["/"]

// Protected routes that require authentication (but not specific roles in middleware)
// Role-based authorization is enforced server-side in components and backend APIs
const PROTECTED_ROUTES = ["/me", "/profile", "/team", "/admin", "/dashboard", "/engines", "/data-ingestion", "/audit-log", "/privacy", "/team-health", "/tenants", "/notifications", "/search", "/ask-sentinel", "/simulation", "/talent-scout"]

/**
 * Extract the access token from Supabase auth cookies
 * Supabase stores auth data in sb-{project_ref}-auth-token as JSON
 */
function getAccessToken(request: NextRequest): string | null {
  // Try project-specific cookie first (Supabase default format)
  const allCookies = request.cookies.getAll()
  const authCookie = allCookies.find(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
  )

  if (authCookie?.value) {
    let rawValue = authCookie.value
    
    // Handle Supabase Auth Helpers "base64-" prefix
    if (rawValue.startsWith("base64-")) {
      try {
        const base64Part = rawValue.replace("base64-", "")
        rawValue = atob(base64Part)
      } catch {
        // base64 decode failed, try next format
      }
    }

    try {
      // Decode URI if needed and parse JSON
      // Some cookies are URI encoded, others not. unique decoding.
      const decodedVal = decodeURIComponent(rawValue)
      const data = JSON.parse(decodedVal)

      if (data.access_token) {
        return data.access_token
      }
      
      // Handle array format (common in some Supabase versions)
      // Format: ["session", { access_token: "..." }]
      if (Array.isArray(data)) {
        for (const item of data) {
          if (typeof item === 'object' && item?.access_token) {
            return item.access_token
          }
        }
      }
    } catch {
      // If parsing fails, check if the value itself is a JWT
      // JWTs start with "ey"
      if (rawValue.startsWith("ey")) {
        return rawValue
      }
    }
  }

  // Fall back to sb-access-token (legacy/alternative format)
  const legacyToken = request.cookies.get("sb-access-token")?.value
  if (legacyToken && legacyToken.startsWith("ey")) {
    return legacyToken
  }

  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token from cookies using the helper function
  const token = getAccessToken(request)

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // If not protected, allow through
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // If no token and trying to access protected route, redirect to login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // ============================================================================
  // SECURE APPROACH: No client-side JWT decoding for authorization
  // ============================================================================
  // We do NOT decode the JWT here because:
  // 1. Client-side decoding has no signature verification
  // 2. Attackers can forge JWTs with arbitrary roles
  // 3. Even UI-only access to admin routes is information disclosure
  //
  // Instead:
  // - All authenticated users can access the /dashboard route
  // - Server components fetch user role from backend API (with verified JWT)
  // - UI components render role-appropriate content based on verified role
  // - Backend APIs enforce RBAC with require_role() dependency
  // ============================================================================

  // Redirect root to dashboard for all authenticated users
  if (ROLE_BASED_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Allow all authenticated users to access protected routes
  // Server-side components will fetch and verify actual roles from backend
  return NextResponse.next()
}

// Configure middleware to run on specific paths
// NOTE: "/" is excluded — landing page is public
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/engines/:path*",
    "/me/:path*",
    "/profile/:path*",
    "/team/:path*",
    "/admin/:path*",
    "/data-ingestion/:path*",
    "/audit-log/:path*",
    "/privacy/:path*",
    "/team-health/:path*",
    "/tenants/:path*",
    "/notifications/:path*",
    "/search/:path*",
    "/ask-sentinel/:path*",
    "/simulation/:path*",
    "/talent-scout/:path*",
    "/workflows/:path*",
    "/marketplace/:path*",
    "/onboarding/:path*",
    "/employee/:path*",
    "/demo/:path*",
    "/auth/sso/:path*",
  ],
}

