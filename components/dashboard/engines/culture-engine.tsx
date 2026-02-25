"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  Heart, Users, Sparkles, TrendingUp, Calendar, Coffee, MessageSquare
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Employee } from "@/types"
import { cn } from "@/lib/utils"

// Recharts for the bar chart
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts"

interface CultureEngineProps {
  employees: Employee[]
}

export function CultureEngine({ employees }: CultureEngineProps) {
  
  // Aggregate Metrics (Mock for now, as useTeamData is complex)
  const metrics = useMemo(() => {
    return {
      sentiment: "Neutral",
      score: 89,
      activeMembers: employees.length,
      recentHighlights: 4,
      positive: 55,
      neutral: 27,
      negative: 18 // Adjusted to sum to 100 roughly
    }
  }, [employees])

  // Mock Trend Data
  const trendData = [
    { name: 'Mon', positive: 40, neutral: 20, negative: 10 },
    { name: 'Tue', positive: 30, neutral: 30, negative: 15 },
    { name: 'Wed', positive: 50, neutral: 10, negative: 5 },
    { name: 'Thu', positive: 45, neutral: 25, negative: 10 },
    { name: 'Fri', positive: 60, neutral: 15, negative: 5 },
    { name: 'Sat', positive: 20, neutral: 10, negative: 0 },
    { name: 'Sun', positive: 10, neutral: 5, negative: 0 },
  ]
  // Expand data to fit chart look (30 days)
  const expandedData = Array.from({ length: 30 }, (_, i) => ({
     day: i,
     val: Math.floor(Math.random() * 60) + 40,
     color: i % 2 === 0 ? "#ec4899" : "#db2777" // Pink variations
  }))

  const highlights = [
     { icon: Sparkles, text: "Team celebration yesterday", type: "positive" },
     { icon: TrendingUp, text: "Successful project launch", type: "positive" },
     { icon: Coffee, text: "New coffee machine installed", type: "neutral" },
     { icon: Users, text: "Team building event planned", type: "positive" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
         
         {/* Main Temperature Card */}
         <Card className="relative overflow-hidden bg-[#1a1a2e] border-pink-500/10 h-[300px] flex items-center justify-center">
            <div className="absolute top-0 left-0 p-4 opacity-10">
               <Heart className="w-48 h-48 text-pink-500" />
            </div>
            <div className="z-10 text-center space-y-2">
               <div className="relative inline-block">
                  <div className="w-48 h-48 rounded-full border-4 border-pink-500/10 flex items-center justify-center bg-pink-500/5 shadow-[0_0_40px_-5px_rgba(236,72,153,0.3)]">
                     <div className="text-center">
                        <div className="text-6xl font-black text-slate-100 tracking-tighter">67°</div>
                        <div className="text-xs uppercase tracking-widest text-pink-400 font-bold mt-1">Temperature</div>
                     </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-pink-500/30 text-pink-300 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                     Warm
                  </div>
               </div>
               <div className="mt-4 flex items-center justify-center gap-2 text-pink-300/80 text-sm">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Healthy team culture with room to grow
               </div>
            </div>
         </Card>

         {/* Right Side Key Stats */}
         <div className="grid grid-rows-3 gap-4 h-[300px]">
            {/* Team Sentiment */}
            <Card className="bg-pink-950/10 border-pink-500/10 flex items-center px-6">
               <div className="mr-6 p-4 bg-pink-500/10 rounded-xl text-pink-500">
                  <MessageSquare className="w-6 h-6" />
               </div>
               <div className="flex-1">
                  <div className="text-sm font-medium text-pink-200">Team Sentiment</div>
                  <div className="text-xs text-pink-400/60">Overall mood analysis</div>
               </div>
               <div className="text-right">
                  <div className="text-2xl font-bold text-white">Neutral</div>
                  <div className="text-xs text-pink-500">Score: 89</div>
               </div>
            </Card>

            {/* Active Members */}
            <Card className="bg-purple-950/10 border-purple-500/10 flex items-center px-6">
               <div className="mr-6 p-4 bg-purple-500/10 rounded-xl text-purple-500">
                  <Users className="w-6 h-6" />
               </div>
               <div className="flex-1">
                  <div className="text-sm font-medium text-purple-200">Active Members</div>
                  <div className="text-xs text-purple-400/60">Team size</div>
               </div>
               <div className="text-right">
                  <div className="text-2xl font-bold text-white">{metrics.activeMembers}</div>
                  <div className="text-xs text-purple-500">Active</div>
               </div>
            </Card>

            {/* Recent Highlights */}
            <Card className="bg-indigo-950/10 border-indigo-500/10 flex items-center px-6">
               <div className="mr-6 p-4 bg-indigo-500/10 rounded-xl text-indigo-500">
                  <Sparkles className="w-6 h-6" />
               </div>
               <div className="flex-1">
                  <div className="text-sm font-medium text-indigo-200">Recent Highlights</div>
                  <div className="text-xs text-indigo-400/60">Latest team moments</div>
               </div>
               <div className="text-right">
                  <div className="text-2xl font-bold text-white">{metrics.recentHighlights}</div>
                  <div className="text-xs text-indigo-500">This week</div>
               </div>
            </Card>
         </div>
      </div>

      {/* ─── Breakdown Row ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
         
         {/* Sentiment Breakdown */}
         <Card className="lg:col-span-2 bg-slate-900/40 border-white/5 backdrop-blur-sm">
            <CardHeader>
               <CardTitle className="flex items-center gap-2 text-slate-200">
                  <Heart className="w-5 h-5 text-pink-500" /> Sentiment Breakdown
               </CardTitle>
               <CardDescription>Detailed analysis of team mood</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-6">
                  {/* Progress Bar Header */}
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                     <span>Overall Score</span>
                     <span className="text-pink-500">89/100</span>
                  </div>
<Progress value={89} className="h-3 bg-slate-800" indicatorColor="bg-pink-500" />
                   
                   {/* 3 Main Blocks */}
                   <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-4 text-center">
                         <div className="text-3xl font-bold text-emerald-400">55%</div>
                         <div className="text-xs font-medium text-emerald-500 mt-1 uppercase">Positive</div>
                      </div>
                     <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-amber-400">27%</div>
                        <div className="text-xs font-medium text-amber-600 mt-1 uppercase">Neutral</div>
                     </div>
                     <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-400">18%</div>
                        <div className="text-xs font-medium text-red-600 mt-1 uppercase">Negative</div>
                     </div>
                  </div>

                  {/* Highlights List */}
                  <div className="space-y-3 mt-6">
                     <div className="text-sm font-semibold text-slate-400">Recent Highlights</div>
                     {highlights.map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-border">
                           <div className="flex items-center gap-3">
                              <h.icon className="w-4 h-4 text-amber-400" />
                              <span className="text-sm text-slate-300">{h.text}</span>
                           </div>
                           <Badge variant="outline" className={cn(
                              "text-[10px] h-5 uppercase border-0",
                              h.type === "positive" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                           )}>{h.type}</Badge>
                        </div>
                     ))}
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Culture Metrics */}
         <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-purple-500" /> Culture Metrics
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-8 pt-6">
                {[
                   { label: "Cross-team Projects", score: 79, trend: "42.8%", color: "bg-emerald-500" },
                   { label: "Knowledge Sharing", score: 87, trend: "3.2%", color: "bg-emerald-500" },
                   { label: "Team Bonding Events", score: 74, trend: "15.1%", color: "bg-emerald-500" },
                   { label: "Peer Recognition", score: 61, trend: "10.1%", color: "bg-white" } // White in screenshot bottom bar?
                ].map((m, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                         <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-slate-500" />
                            {m.label}
                         </div>
                         <span className={cn("text-[10px]", m.trend.includes("-") ? "text-red-400" : "text-emerald-400")}>{m.trend}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className={cn("h-full rounded-full", m.color)} style={{ width: `${m.score}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                         <span>Score</span>
                         <span className={cn("font-bold", m.color === "bg-slate-200" ? "text-slate-200" : "text-emerald-400" )}>{m.score}/100</span>
                      </div>
                   </div>
                ))}
             </CardContent>
         </Card>

      </div>

      {/* ─── Team Mood Chart ──────────────────────────────────────────── */}
      <Card className="bg-slate-900/60 border-white/5">
         <CardHeader>
            <CardTitle className="text-base text-slate-200 flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-pink-400" /> Team Mood Over Time
            </CardTitle>
            <CardDescription>30-day mood trend analysis</CardDescription>
         </CardHeader>
         <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={expandedData}>
                  <XAxis dataKey="day" hide />
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                     itemStyle={{ color: '#ec4899' }}
                     cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                     {expandedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                     ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </CardContent>
      </Card>

    </div>
  )
}
