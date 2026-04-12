"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Activity, TrendingUp, ShieldCheck, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function LandingHero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const stats = [
    { label: "6 Behavioral Signals", icon: Activity },
    { label: "30-Day Trends", icon: TrendingUp },
    { label: "Zero Content Access", icon: ShieldCheck },
    { label: "Two-Vault Privacy", icon: Database },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20">
      <div className="container relative px-6">
        {/* Badge */}
        <div className={cn(
          "flex justify-center mb-8 opacity-0 translate-y-4 transition-all duration-500",
          mounted && "opacity-100 translate-y-0"
        )}>
          <Badge variant="outline" className="gap-2 px-4 py-1.5 rounded-full border-border bg-emerald-500/10 text-emerald-500 text-sm font-medium">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Behavioral Signal Intelligence
          </Badge>
        </div>

        {/* Headline */}
        <div className={cn(
          "text-center mb-6 opacity-0 translate-y-6 transition-all duration-700 delay-100",
          mounted && "opacity-100 translate-y-0"
        )}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
            Know Your Team{" "}
            <span className="text-emerald-500">Before It's Too Late.</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className={cn(
          "text-center mb-12 opacity-0 translate-y-6 transition-all duration-700 delay-200",
          mounted && "opacity-100 translate-y-0"
        )}>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Sentinel measures the velocity of behavioral change using metadata only.
            No message content. No surveillance. Just timestamps, frequencies, and
            network patterns that reveal what surveys miss.
          </p>
        </div>

        {/* CTAs */}
        <div className={cn(
          "flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 opacity-0 translate-y-6 transition-all duration-700 delay-300",
          mounted && "opacity-100 translate-y-0"
        )}>
          <Link href="/onboarding">
            <Button size="lg" className="h-12 px-7 rounded-xl font-medium text-base bg-emerald-600 hover:bg-emerald-700 text-white group">
              Try Interactive Demo
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Stats row */}
        <div className={cn(
          "grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto opacity-0 translate-y-6 transition-all duration-700 delay-[400ms]",
          mounted && "opacity-100 translate-y-0"
        )}>
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-4 py-5 text-center"
            >
              <stat.icon className="h-5 w-5 text-emerald-500/70" />
              <span className="text-sm font-medium text-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
