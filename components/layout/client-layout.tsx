"use client"

import React, { useCallback, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { CommandPalette } from "@/components/command-palette"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Search } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notification-center"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  engines: "Engines",
  network: "Network",
  talent: "Talent",
  safety: "Safety",
  culture: "Culture",
  admin: "Admin",
  me: "My Wellbeing",
  team: "My Team",
  "data-ingestion": "Data Pipeline",
  "ask-sentinel": "Ask Sentinel",
}

function formatSegment(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ??
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  )
}

function useBreadcrumbs(pathname: string) {
  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length === 0) return []

    return segments.map((segment, index) => ({
      label: formatSegment(segment),
      href: "/" + segments.slice(0, index + 1).join("/"),
      isLast: index === segments.length - 1,
    }))
  }, [pathname])
}

const NO_SIDEBAR_PATHS = new Set(["/", "/login", "/register", "/ask-sentinel"])

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const breadcrumbs = useBreadcrumbs(pathname)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleCommandNavigate = useCallback(
    (view: string) => {
      const directRoutes = [
        "data-ingestion",
        "me",
        "team",
        "admin",
        "ask-sentinel",
      ]
      if (directRoutes.includes(view)) {
        router.push(`/${view}`)
      } else if (view.startsWith("engines/") || view.startsWith("/engines/")) {
        router.push(view.startsWith("/") ? view : `/${view}`)
      } else {
        router.push(`/dashboard?view=${view}`)
      }
    },
    [router],
  )

  if (NO_SIDEBAR_PATHS.has(pathname)) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <CommandPalette onNavigate={handleCommandNavigate} />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem
                      className={index < breadcrumbs.length - 1 ? "hidden md:block" : undefined}
                    >
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!crumb.isLast && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-3 px-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="h-9 w-52 rounded-lg border border-white/10 bg-card pl-9 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
              />
            </div>
            <ThemeToggle />
            <NotificationCenter />
            <Badge
              variant="outline"
              className="hidden gap-1.5 border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary sm:flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary dot-pulse" />
              Live
            </Badge>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
