'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { handleSSOCallback } from '@/lib/sso'

function SSOCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const provider = searchParams.get('provider') || 'google'
    const errorMsg = searchParams.get('error')

    if (errorMsg) {
      setError(`SSO authentication failed: ${decodeURIComponent(errorMsg)}`)
      return
    }

    if (!code) {
      setError('No authorization code received from identity provider')
      return
    }

    const storedState = sessionStorage.getItem('sso_state')
    if (!state || state !== storedState) {
      setError('Invalid state parameter. Authentication request may have been tampered with.')
      return
    }
    sessionStorage.removeItem('sso_state')

    handleSSOCallback(provider, code, state)
      .then((result) => {
        setSuccess(true)
        // Show success briefly then redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || err?.message || 'SSO authentication failed')
      })
  }, [searchParams, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        {error ? (
          <>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <span className="text-destructive text-2xl">x</span>
            </div>
            <h2 className="text-lg font-semibold">Authentication Failed</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <a href="/login" className="inline-block text-primary underline text-sm">Back to Login</a>
          </>
        ) : success ? (
          <>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <span className="text-green-500 text-2xl">OK</span>
            </div>
            <h2 className="text-lg font-semibold">SSO Authentication Successful</h2>
            <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
          </>
        ) : (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Completing SSO authentication...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function SSOCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <SSOCallbackContent />
    </Suspense>
  )
}
