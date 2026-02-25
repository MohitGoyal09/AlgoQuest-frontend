"use client"

import { Switch } from "@/components/ui/switch"
import { Eye, EyeOff } from "lucide-react"

interface AnonymityToggleProps {
  isAnonymized: boolean
  onToggle: (checked: boolean) => void
}

export function AnonymityToggle({ isAnonymized, onToggle }: AnonymityToggleProps) {
  return (
    <div className="flex items-center space-x-2 bg-[#0b101b] border border-white/10 px-4 py-2 rounded-full">
      <div className={`p-1.5 rounded-full ${isAnonymized ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-400'}`}>
        {isAnonymized ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </div>
      <label htmlFor="anonymity-mode" className="text-sm font-medium text-slate-200 cursor-pointer select-none">
        {isAnonymized ? 'Anonymity Mode: ON' : 'Anonymity Mode: OFF'}
      </label>
      <Switch
        id="anonymity-mode"
        checked={isAnonymized}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-purple-500"
      />
    </div>
  )
}
