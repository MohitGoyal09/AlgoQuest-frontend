"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Play, Check, Shield, Zap, Heart, Network, Users, BarChart3, Sparkles, Lock, Eye, Globe, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function LandingHero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const stats = [
    { value: "94%", label: "Burnout Detection Accuracy" },
    { value: "3.2x", label: "Hidden Talent Discovery" },
    { value: "100%", label: "Privacy Compliant" },
    { value: "50+", label: "Team Integrations" },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.15)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.1)_0%,_transparent_40%)]" />
      
      <div className="container relative z-10 px-6">
        {/* Badge */}
        <div className={cn(
          "flex justify-center mb-8 opacity-0 translate-y-4 transition-all duration-700",
          mounted && "opacity-100 translate-y-0"
        )}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>AI-Powered Employee Insights</span>
          </div>
        </div>

        {/* Headline */}
        <div className={cn(
          "text-center mb-6 opacity-0 translate-y-8 transition-all duration-700 delay-100",
          mounted && "opacity-100 translate-y-0"
        )}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Predict Burnout.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
              Uncover Hidden Talent.
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className={cn(
          "text-center mb-10 opacity-0 translate-y-8 transition-all duration-700 delay-200",
          mounted && "opacity-100 translate-y-0"
        )}>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Sentinel uses AI to monitor team health, detect burnout risks early, and identify your top performers—all while respecting employee privacy.
          </p>
        </div>

        {/* CTAs */}
        <div className={cn(
          "flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0 translate-y-8 transition-all duration-700 delay-300",
          mounted && "opacity-100 translate-y-0"
        )}>
          <Link href="/login">
            <Button size="lg" className="h-14 px-8 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-lg shadow-green-600/25 transition-all duration-300 group">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-lg transition-all duration-300">
              <Play className="mr-2 h-5 w-5 fill-current" />
              Watch Demo
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className={cn(
          "grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto opacity-0 translate-y-8 transition-all duration-700 delay-500",
          mounted && "opacity-100 translate-y-0"
        )}>
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
