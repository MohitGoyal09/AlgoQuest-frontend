"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"

import { ScrollArea } from "@/components/ui/scroll-area"
import { ProtectedRoute } from "@/components/protected-route"
import { IntegrationCard } from "@/components/integration-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Shield,
  Gem,
  Thermometer,
  Link as LinkIcon,
  ChevronRight,
  Info,
} from "lucide-react"

import { connectTool, disconnectTool, getConnectedTools } from "@/lib/api"

// ============================================================================
// TYPES
// ============================================================================

interface IntegrationDef {
  name: string
  slug: string
  description: string
  category: string
  icon: string
  comingSoon?: boolean
}

type CategoryTab = "my-apps" | "marketplace"

// ============================================================================
// STATIC INTEGRATION DEFINITIONS
// ============================================================================

const ACTIVE_INTEGRATIONS: IntegrationDef[] = [
  {
    name: "Google Calendar",
    slug: "googlecalendar",
    description:
      "Analyze meeting load and schedule density to surface early burnout signals and calendar overload patterns.",
    category: "Productivity",
    icon: "📅",
  },
  {
    name: "Slack",
    slug: "slack",
    description:
      "Measure communication frequency, after-hours activity, and sentiment patterns from team conversations.",
    category: "Communication",
    icon: "💬",
  },
  {
    name: "GitHub",
    slug: "github",
    description:
      "Track code activity, commit frequency, PR review burden, and identify potential review bottlenecks.",
    category: "Engineering",
    icon: "🐙",
  },
  {
    name: "Jira",
    slug: "jira",
    description:
      "Monitor task velocity, sprint burndown, ticket overcommitment patterns, and blocked engineer signals.",
    category: "Project Management",
    icon: "🎯",
  },
]

const COMING_SOON_INTEGRATIONS: IntegrationDef[] = [
  {
    name: "Microsoft Teams",
    slug: "msteams",
    description: "Communication patterns and meeting load from Teams channels.",
    category: "Communication",
    icon: "🟦",
    comingSoon: true,
  },
  {
    name: "Notion",
    slug: "notion",
    description: "Document activity and async collaboration signals.",
    category: "Productivity",
    icon: "📓",
    comingSoon: true,
  },
  {
    name: "Linear",
    slug: "linear",
    description: "Issue tracking velocity and sprint health metrics.",
    category: "Project Management",
    icon: "📐",
    comingSoon: true,
  },
  {
    name: "Zoom",
    slug: "zoom",
    description: "Video meeting duration, frequency, and participation patterns.",
    category: "Communication",
    icon: "📹",
    comingSoon: true,
  },
]

const ALL_INTEGRATIONS: IntegrationDef[] = [
  ...ACTIVE_INTEGRATIONS,
  ...COMING_SOON_INTEGRATIONS,
]

const ENGINE_MAPPINGS = [
  { engine: "Safety Engine", icon: Shield, tools: ["GitHub", "Slack"], color: "hsl(var(--sentinel-critical))" },
  { engine: "Talent Scout", icon: Gem, tools: ["GitHub", "Jira"], color: "hsl(var(--sentinel-gem))" },
  { engine: "Culture Engine", icon: Thermometer, tools: ["Slack", "Google Calendar"], color: "hsl(var(--sentinel-critical))" },
  { engine: "Network Engine", icon: LinkIcon, tools: ["Slack", "GitHub"], color: "hsl(var(--primary))" },
]

const ROTATING_TITLES = [
  "One platform for every integration",
  "Connect your team's favorite tools",
  "AI-powered insights from your stack",
  "Unified visibility across all tools",
]

// ============================================================================
// HOOKS
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Floating emoji element for the banner */
function FloatingIcon({
  emoji,
  className,
}: {
  emoji: string
  className: string
}) {
  return (
    <div
      className={`absolute flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-card/80 text-xl shadow-sm backdrop-blur-sm ${className}`}
    >
      {emoji}
    </div>
  )
}

/** Animated hero banner shown in Marketplace tab */
function MarketplaceBanner() {
  const [titleIndex, setTitleIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true)
      setTimeout(() => {
        setTitleIndex((prev) => (prev + 1) % ROTATING_TITLES.length)
        setIsFading(false)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {/* Grid background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />

      {/* Floating tool icons */}
      <FloatingIcon emoji="📅" className="left-[5%] top-4 rotate-[-8deg] hidden md:flex" />
      <FloatingIcon emoji="💬" className="right-[8%] top-6 rotate-[6deg] hidden md:flex" />
      <FloatingIcon emoji="🐙" className="left-[10%] bottom-4 rotate-[10deg] hidden lg:flex" />
      <FloatingIcon emoji="🎯" className="right-[12%] bottom-6 rotate-[-5deg] hidden lg:flex" />
      <FloatingIcon emoji="📓" className="left-[25%] top-3 rotate-[4deg] hidden xl:flex" />
      <FloatingIcon emoji="📹" className="right-[25%] bottom-3 rotate-[-7deg] hidden xl:flex" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-4 px-6 py-14 text-center md:py-16">
        <Badge
          variant="secondary"
          className="gap-1.5 rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {ALL_INTEGRATIONS.length}+ Integrations
        </Badge>

        <h1
          className={`max-w-lg text-2xl font-bold tracking-tight text-foreground transition-opacity duration-400 md:text-3xl ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {ROTATING_TITLES[titleIndex]}
        </h1>

        <p className="max-w-md text-sm text-muted-foreground">
          Connect your team&apos;s tools to power Sentinel&apos;s AI engines with real-time
          signals from across your organization.
        </p>
      </div>
    </div>
  )
}

/** Shimmer loading skeleton grid */
function ShimmerGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="mt-auto flex items-center justify-between pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// PAGE CONTENT
// ============================================================================

function MarketplaceContent() {
  const [connectedSlugs, setConnectedSlugs] = useState<Set<string>>(new Set())
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<CategoryTab>("marketplace")
  const [searchQuery, setSearchQuery] = useState("")

  const debouncedSearch = useDebounce(searchQuery, 1000)

  // ---- Data fetching ----

  const fetchConnectedTools = useCallback(async () => {
    try {
      const data = (await getConnectedTools()) as Record<string, unknown>
      const slugs: string[] =
        (data?.connected_tools as string[]) ??
        ((data?.data as Record<string, unknown>)?.connected_tools as string[]) ??
        []
      setConnectedSlugs(new Set(slugs))
    } catch {
      // Silently handle -- backend may not have /tools/connected yet
    } finally {
      setIsInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConnectedTools()
  }, [fetchConnectedTools])

  // Clear search when switching tabs
  useEffect(() => {
    setSearchQuery("")
  }, [activeTab])

  // ---- Handlers ----

  const handleConnect = async (slug: string) => {
    setLoadingSlug(slug)
    const integration = ALL_INTEGRATIONS.find((i) => i.slug === slug)
    try {
      const result = await connectTool(slug)
      const data = result as { redirect_url?: string; success?: boolean }
      if (data?.redirect_url) {
        window.location.href = data.redirect_url
        return
      }
      setConnectedSlugs((prev) => new Set([...prev, slug]))
      toast.success(`Connected to ${integration?.name ?? slug}`)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to connect integration"
      toast.error(message)
    } finally {
      setLoadingSlug(null)
    }
  }

  const handleDisconnect = async (slug: string) => {
    setLoadingSlug(slug)
    try {
      await disconnectTool(slug)
      setConnectedSlugs((prev) => {
        const next = new Set(prev)
        next.delete(slug)
        return next
      })
      toast.success(
        `Disconnected ${ALL_INTEGRATIONS.find((i) => i.slug === slug)?.name ?? slug}`
      )
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to disconnect integration"
      toast.error(message)
    } finally {
      setLoadingSlug(null)
    }
  }

  // ---- Filtered integrations ----

  const filteredIntegrations = useMemo(() => {
    const source =
      activeTab === "my-apps"
        ? ALL_INTEGRATIONS.filter((i) => connectedSlugs.has(i.slug))
        : ALL_INTEGRATIONS

    if (!debouncedSearch.trim()) return source

    const query = debouncedSearch.toLowerCase()
    return source.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query)
    )
  }, [activeTab, connectedSlugs, debouncedSearch])

  const totalForTab =
    activeTab === "my-apps"
      ? ALL_INTEGRATIONS.filter((i) => connectedSlugs.has(i.slug)).length
      : ALL_INTEGRATIONS.length

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1">
        <main className="flex flex-col gap-6 p-6 lg:p-10">
          {/* -------------------------------------------------------------- */}
          {/* Category Tabs + Search                                          */}
          {/* -------------------------------------------------------------- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("my-apps")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === "my-apps"
                    ? "bg-primary text-white shadow-md"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                My Apps
              </button>
              <button
                onClick={() => setActiveTab("marketplace")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === "marketplace"
                    ? "bg-primary text-white shadow-md"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                Marketplace
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integrations..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Marketplace Banner (only in Marketplace tab)                    */}
          {/* -------------------------------------------------------------- */}
          {activeTab === "marketplace" && <MarketplaceBanner />}

          {/* -------------------------------------------------------------- */}
          {/* Tools count                                                     */}
          {/* -------------------------------------------------------------- */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredIntegrations.length}
              </span>{" "}
              / {totalForTab} tools
            </p>
            {activeTab === "my-apps" && filteredIntegrations.length === 0 && !isInitialLoading && (
              <p className="text-sm text-muted-foreground">
                No connected apps yet. Head to the Marketplace to get started.
              </p>
            )}
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Tool cards grid                                                 */}
          {/* -------------------------------------------------------------- */}
          {isInitialLoading ? (
            <ShimmerGrid />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.slug}
                  {...integration}
                  connected={connectedSlugs.has(integration.slug)}
                  lastSync={
                    connectedSlugs.has(integration.slug)
                      ? "Sync active"
                      : undefined
                  }
                  isLoading={loadingSlug === integration.slug}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </div>
          )}

          {/* Empty state for search */}
          {!isInitialLoading &&
            filteredIntegrations.length === 0 &&
            debouncedSearch.trim() !== "" && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/30 text-2xl">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  No integrations found
                </p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Try adjusting your search query or browse all integrations in the
                  Marketplace tab.
                </p>
              </div>
            )}

          {/* -------------------------------------------------------------- */}
          {/* Data preview -- engine mapping                                  */}
          {/* -------------------------------------------------------------- */}
          <section className="glass-card rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Data Preview
              </h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Connected tools power these Sentinel engines:
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {ENGINE_MAPPINGS.map(({ engine, icon: Icon, tools, color }) => (
                <div
                  key={engine}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {engine}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      {tools.map((tool, idx) => (
                        <span key={tool} className="flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className={`text-[9px] px-1.5 py-0 ${
                              ACTIVE_INTEGRATIONS.find((i) => i.name === tool) &&
                              connectedSlugs.has(
                                ACTIVE_INTEGRATIONS.find((i) => i.name === tool)!
                                  .slug
                              )
                                ? "bg-[hsl(var(--sentinel-healthy))]/10 text-[hsl(var(--sentinel-healthy))]"
                                : "bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            {tool}
                          </Badge>
                          {idx < tools.length - 1 && (
                            <span className="text-[10px] text-muted-foreground">
                              ·
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* -------------------------------------------------------------- */}
          {/* Footer                                                          */}
          {/* -------------------------------------------------------------- */}
          <div className="flex items-center justify-center gap-6 py-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              <span>
                OAuth tokens are managed securely by Composio — never stored in
                Sentinel
              </span>
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <MarketplaceContent />
    </ProtectedRoute>
  )
}
