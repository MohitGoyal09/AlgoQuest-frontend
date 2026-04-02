"use client"

import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export interface IntegrationCardProps {
  name: string
  slug: string
  description: string
  category: string
  icon: string
  connected: boolean
  lastSync?: string
  eventsCount?: number
  comingSoon?: boolean
  onConnect: (slug: string) => void
  onDisconnect: (slug: string) => void
  isLoading?: boolean
}

export function IntegrationCard({
  name,
  slug,
  description,
  category,
  icon,
  connected,
  lastSync,
  eventsCount,
  comingSoon = false,
  onConnect,
  onDisconnect,
  isLoading = false,
}: IntegrationCardProps) {
  const handleAction = () => {
    if (comingSoon || isLoading) return
    if (connected) {
      onDisconnect(slug)
    } else {
      onConnect(slug)
    }
  }

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-2xl border p-5 transition-[transform,box-shadow,border-color] duration-200 ${
        comingSoon
          ? "border-border bg-card/40 opacity-60"
          : "border-border bg-card feature-card-hover hover:border-border/80 hover:shadow-lg hover:shadow-black/10"
      }`}
    >
      {/* Status dot */}
      {!comingSoon && (
        <div
          className={`absolute right-4 top-4 h-2.5 w-2.5 rounded-full ${
            connected
              ? "bg-[hsl(var(--sentinel-healthy))] shadow-[0_0_6px_hsl(var(--sentinel-healthy)/0.6)] animate-pulse-subtle"
              : "bg-muted-foreground/30"
          }`}
        />
      )}

      {/* Icon + name */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 text-2xl">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-foreground">{name}</p>
          <p className="text-[11px] text-muted-foreground">{category}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] leading-relaxed text-muted-foreground">{description}</p>

      {/* Sync info (only when connected) */}
      {connected && !comingSoon && (
        <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--sentinel-healthy))]/5 px-3 py-2 border border-[hsl(var(--sentinel-healthy))]/15">
          <div>
            <p className="text-[10px] text-muted-foreground">Last sync</p>
            <p className="text-[12px] font-medium text-foreground">{lastSync ?? "Just now"}</p>
          </div>
          {eventsCount !== undefined && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Events</p>
              <p className="text-[12px] font-medium font-mono tabular-nums text-[hsl(var(--sentinel-healthy))]">
                {eventsCount.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer: badge + button */}
      <div className="mt-auto flex items-center justify-between gap-2">
        {comingSoon ? (
          <Badge
            variant="secondary"
            className="bg-muted/50 text-[10px] text-muted-foreground"
          >
            Coming Soon
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className={
              connected
                ? "bg-[hsl(var(--sentinel-healthy))]/10 text-[10px] text-[hsl(var(--sentinel-healthy))]"
                : "bg-muted/50 text-[10px] text-muted-foreground"
            }
          >
            {connected ? "Connected" : "Disconnected"}
          </Badge>
        )}

        {!comingSoon && (
          <button
            onClick={handleAction}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-[transform,opacity,background,border-color,color] duration-150 active:scale-[0.97] ${
              connected
                ? "border border-border text-muted-foreground hover:border-[hsl(var(--sentinel-critical))]/40 hover:bg-[hsl(var(--sentinel-critical))]/5 hover:text-[hsl(var(--sentinel-critical))]"
                : "bg-primary text-primary-foreground hover:opacity-90"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            {connected ? "Disconnect" : "Connect"}
          </button>
        )}
      </div>
    </div>
  )
}
