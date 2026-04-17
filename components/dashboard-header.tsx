import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notification-center"
import type { UserSummary } from "@/types"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  selectedUser: UserSummary | null
  activeView: string
}

const viewLabels: Record<string, string> = {
  dashboard: "Overview",
  "safety-valve": "Safety Valve",
  "talent-scout": "Talent Scout",
  culture: "Team Health",
  network: "Network Graph",
  simulation: "Simulation",
  admin: "Admin Panel",
  team: "My Team",
  "employee-detail": "Employee Detail",
}

export function DashboardHeader({ selectedUser, activeView }: DashboardHeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-[15px] font-bold text-foreground">{viewLabels[activeView] || "Dashboard"}</h1>
          {selectedUser && (
            <>
              <span className="text-muted-foreground/30">/</span>
              <span className="rounded-md bg-[hsl(var(--muted))] px-2 py-0.5 font-mono text-xs text-muted-foreground">
                {selectedUser.user_hash}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          {/* Search navigates to /search?q=… on Enter (server-side search) */}
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
  )
}
