"use client"

import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-white/10 py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-green-500" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Sentinel</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            How it Works
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
