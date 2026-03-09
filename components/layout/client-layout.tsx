"use client"

import { Suspense, useState, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { CommandPalette } from "@/components/command-palette"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleCommandNavigate = useCallback((view: string) => {
    // Handle direct page routes
    const directRoutes = ['data-ingestion', 'me', 'team', 'admin', 'ask-sentinel']
    if (directRoutes.includes(view)) {
      router.push(`/${view}`)
    } else if (view.startsWith('engines/') || view.startsWith('/engines/')) {
      router.push(view.startsWith('/') ? view : `/${view}`)
    } else {
      // Dashboard views
      router.push(`/dashboard?view=${view}`)
    }
  }, [router])

  // Hide sidebar on auth pages & landing page
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/"
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <CommandPalette onNavigate={handleCommandNavigate} />
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <Suspense fallback={<div className="w-64 bg-muted animate-pulse" />}>
          <AppSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
        </Suspense>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 shadow-2xl lg:hidden">
            <Suspense fallback={<div className="w-60 bg-muted animate-pulse" />}>
              <AppSidebar
                onToggleCollapse={() => setMobileMenuOpen(false)}
              />
            </Suspense>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold">Sentinel</span>
          </div>
        </div>

        <main className={cn(
          "flex-1 overflow-x-hidden",
          pathname === "/ask-sentinel" ? "overflow-y-hidden p-0" : "overflow-y-auto p-4 lg:p-6"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}
