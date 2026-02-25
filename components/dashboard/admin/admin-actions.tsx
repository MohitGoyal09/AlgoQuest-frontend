"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UserCog, Lock, Database } from "lucide-react"

export function AdminQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <Card className="bg-[#111827] border-white/10 hover:border-teal-500/30 transition-colors group cursor-pointer">
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-white text-base">
                <UserCog className="w-5 h-5 text-teal-400" />
                User Management
             </CardTitle>
             <CardDescription>Add, remove, or modify roles.</CardDescription>
          </CardHeader>
       </Card>

       <Card className="bg-[#111827] border-white/10 hover:border-purple-500/30 transition-colors group">
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-white text-base">
                <Lock className="w-5 h-5 text-purple-400" />
                Global Anonymity
             </CardTitle>
             <CardDescription>
                <div className="flex items-center justify-between mt-2">
                   <Label htmlFor="global-privacy" className="text-xs text-gray-400">Force Hashed IDs</Label>
                   <Switch id="global-privacy" />
                </div>
             </CardDescription>
          </CardHeader>
       </Card>

       <Card className="bg-[#111827] border-white/10 hover:border-blue-500/30 transition-colors group cursor-pointer">
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-white text-base">
                <Database className="w-5 h-5 text-blue-400" />
                Integrations
             </CardTitle>
             <CardDescription>
                <div className="flex gap-2 mt-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-xs text-green-400">System Healthy</span>
                </div>
             </CardDescription>
          </CardHeader>
       </Card>
    </div>
  )
}
