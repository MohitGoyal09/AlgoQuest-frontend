"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Shield, Cpu, RefreshCw } from "lucide-react"

export function GlobalStatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-[#0b101b] border-teal-500/20 shadow-lg shadow-teal-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-teal-400">Total Org Health</CardTitle>
          <Activity className="h-4 w-4 text-teal-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">94%</div>
          <p className="text-xs text-muted-foreground mt-1">
            +2.5% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-[#0b101b] border-purple-500/20 shadow-lg shadow-purple-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-400">Active Engines</CardTitle>
          <RefreshCw className="h-4 w-4 text-purple-400 animate-spin-slow" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">4/4</div>
          <p className="text-xs text-muted-foreground mt-1">
            Running optimally
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-[#0b101b] border-amber-500/20 shadow-lg shadow-amber-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-400">System Load</CardTitle>
          <Cpu className="h-4 w-4 text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">Normal</div>
          <p className="text-xs text-muted-foreground mt-1">
            CPU: 42% | Mem: 3.2GB
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#0b101b] border-blue-500/20 shadow-lg shadow-blue-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-400">Active Users</CardTitle>
          <Shield className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">26</div>
          <p className="text-xs text-muted-foreground mt-1">
            100% compliant
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
