"use client"

import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Heart,
  TrendingUp,
  BarChart3,
  User,
  Zap,
  Shield,
  Gem,
  Thermometer,
  Link,
  Plus,
  LogOut,
  User as UserIcon,
  Database,
  FileText,
  Lock,
} from "lucide-react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SettingsModal } from "@/components/settings-modal"
import { createClient } from "@supabase/supabase-js"

interface AppSidebarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const engineSubItems = [
  { id: "safety", label: "Safety Valve", href: "/engines/safety", icon: Shield },
  { id: "talent", label: "Talent Scout", href: "/engines/talent", icon: Gem },
  { id: "culture", label: "Culture", href: "/engines/culture", icon: Thermometer },
  { id: "network", label: "Network", href: "/engines/network", icon: Link },
]

const primaryNavItems: Record<string, Array<{ id: string; label: string; icon: any; href?: string; isDropdown?: boolean }>> = {
  employee: [
    { id: "ask-sentinel", label: "Ask Sentinel", icon: MessageSquare, href: "/ask-sentinel" },
    { id: "wellbeing", label: "My Wellbeing", icon: Heart, href: "/employee" },
    { id: "progress", label: "Progress Report", icon: TrendingUp, href: "/employee?view=progress" },
    { id: "data-ingestion", label: "Data Pipeline", icon: Database, href: "/data-ingestion" },
  ],
  manager: [
    { id: "ask-sentinel", label: "Ask Sentinel", icon: MessageSquare, href: "/ask-sentinel" },
    { id: "team", label: "My Team", icon: Users, href: "/team" },
    { id: "dashboard", label: "Team Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: "team-health", label: "Team Health", icon: Heart, href: "/team-health" },
    { id: "data-ingestion", label: "Data Pipeline", icon: Database, href: "/data-ingestion" },
    { id: "audit-log", label: "Audit Log", icon: FileText, href: "/audit-log" },
    { id: "privacy", label: "Privacy", icon: Lock, href: "/privacy" },
    { id: "engines", label: "Engines", icon: Zap, isDropdown: true },
  ],
  admin: [
    { id: "ask-sentinel", label: "Ask Sentinel", icon: MessageSquare, href: "/ask-sentinel" },
    { id: "admin", label: "Admin Panel", icon: Settings, href: "/admin" },
    { id: "team-health", label: "Team Health", icon: Heart, href: "/team-health" },
    { id: "data-ingestion", label: "Data Pipeline", icon: Database, href: "/data-ingestion" },
    { id: "audit-log", label: "Audit Log", icon: FileText, href: "/audit-log" },
    { id: "privacy", label: "Privacy", icon: Lock, href: "/privacy" },
    { id: "engines", label: "Engines", icon: Zap, isDropdown: true },
  ],
}

export function AppSidebar({ activeView, onViewChange, collapsed, onToggleCollapse }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, userRole, loading } = useAuth()
  const [enginesOpen, setEnginesOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen])

  if (loading) {
    return (
      <aside className="flex h-full w-[260px] items-center justify-center bg-sidebar">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </aside>
    )
  }
  
  const roleDisplayNames: Record<string, string> = {
    admin: "Administrator",
    manager: "Manager",
    employee: "Team Member",
  }
  
  const userRoleName = userRole?.role || "employee"
  const displayRole = roleDisplayNames[userRoleName] || "Team Member"
  const userName = user?.email?.split('@')[0] || "User"
  const userEmail = user?.email || ""
  
  const currentView = pathname === '/dashboard' 
    ? (searchParams.get('view') || 'dashboard')
    : pathname.split('/')[1] || 'dashboard'

  const navItems = primaryNavItems[userRoleName] || primaryNavItems.employee

  const handleNavigation = (id: string, href: string) => {
    router.push(href)
    if (onViewChange) onViewChange(id)
  }

  const isEngineSubItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(href)
  }

  const isEnginesActive = () => {
    return pathname.startsWith('/engines')
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  const renderNavItem = (item: typeof navItems[0]) => {
    if (item.isDropdown) {
      const isActive = isEnginesActive()
      
      if (collapsed) {
        return (
          <Collapsible open={enginesOpen} onOpenChange={setEnginesOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "bg-green-500/10 text-green-400" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
                title={item.label}
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-green-400" : "text-muted-foreground/70 group-hover:text-white")} />
                {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-green-500 rounded-r-full" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 px-2 py-1">
              {engineSubItems.map((subItem) => (
                <button
                  key={subItem.id}
                  onClick={() => handleNavigation(subItem.id, subItem.href)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-[12px] cursor-pointer",
                    isEngineSubItemActive(subItem.href) 
                      ? "text-green-400 bg-green-500/10" 
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <subItem.icon className="h-3.5 w-3.5 shrink-0" />
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )
      }

      return (
        <Collapsible open={enginesOpen} onOpenChange={setEnginesOpen}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-green-500/10 text-green-400" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-green-400" : "text-muted-foreground/70 group-hover:text-white")} />
                <span>{item.label}</span>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", enginesOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 px-2 py-1 ml-3 border-l border-white/10">
            {engineSubItems.map((subItem) => (
              <button
                key={subItem.id}
                onClick={() => handleNavigation(subItem.id, subItem.href)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] cursor-pointer",
                  isEngineSubItemActive(subItem.href) 
                    ? "text-green-400 bg-green-500/10" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <subItem.icon className="h-4 w-4 shrink-0" />
                <span>{subItem.label}</span>
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    const isPageActive = item.href && (
      pathname === item.href || 
      (pathname.startsWith(item.href.split('?')[0]) && item.href !== '/dashboard')
    )
    const activeViewParam = searchParams.get('view')
    const isDashboardView = item.href?.includes('view=') 
        ? activeViewParam === item.href.split('view=')[1] 
        : false;
    
    const isActiveItem = isPageActive || isDashboardView || (pathname === '/dashboard' && !activeViewParam && item.id === 'dashboard')
    
    return (
      <button
        key={item.id}
        onClick={() => item.href && handleNavigation(item.id, item.href)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group relative",
          isActiveItem 
            ? "bg-green-500/10 text-green-400" 
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActiveItem ? "text-green-400" : "text-muted-foreground/70 group-hover:text-white")} />
        {!collapsed && (
            <span>{item.label}</span>
        )}
        {collapsed && isActiveItem && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-green-500 rounded-r-full" />
        )}
      </button>
    )
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-white/5",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between px-4 py-4 h-16">
        <div className="flex items-center gap-3 transition-opacity duration-200">
           <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 shadow-[0_0_10px_-3px_rgba(34,197,94,0.4)]">
            <MessageSquare className="h-4 w-4 text-green-500" />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <span className="text-[15px] font-semibold tracking-tight text-white leading-none">
                Sentinel
              </span>
              <span className="text-[10px] text-muted-foreground pt-1">
                Employee Insights
              </span>
            </div>
          )}
        </div>
        {!collapsed && onToggleCollapse && (
           <button onClick={onToggleCollapse} aria-label="Toggle sidebar" className="text-muted-foreground/50 hover:text-white transition-colors p-1">
              <ChevronLeft className="h-4 w-4" />
           </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-6 scrollbar-thin scrollbar-thumb-white/5 hover:scrollbar-thumb-white/10">
        
        {/* Primary Section */}
        <div className="space-y-0.5">
          {navItems.map((item, index) => (
            <div key={item.id || index}>
              {renderNavItem(item)}
            </div>
          ))}
        </div>

        {/* New Chat Button */}
        <div className="space-y-0.5 px-2">
          <button
            onClick={() => router.push("/ask-sentinel")}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group text-green-400 hover:bg-green-500/10"
          >
            <Plus className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>New Chat</span>}
          </button>
        </div>

      </nav>

      {/* User Info Footer */}
      <div className="mt-auto border-t border-white/5 p-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDropdownOpen(prev => !prev)
            }}
            aria-label="User menu"
            className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5 cursor-pointer group"
          >
            <Avatar className="h-9 w-9 rounded-lg border border-white/10 group-hover:border-white/20 transition-colors">
                <AvatarFallback className="bg-green-600 text-[11px] text-white">
                    {getInitials(userName)}
                </AvatarFallback>
            </Avatar>
            {!collapsed && (
                <div className="flex-1 overflow-hidden text-left">
                    <p className="text-[13px] font-medium text-white truncate leading-none group-hover:text-green-400 transition-colors">
                        {userName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate leading-snug pt-1">
                          {displayRole}
                    </p>
                </div>
            )}
            {!collapsed && (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {/* Dropdown Menu */}
          {!collapsed && (
            <div
              role="menu"
              className={cn(dropdownOpen ? "" : "hidden", "absolute bottom-full left-0 right-0 mb-1 bg-[#0f172a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50")}
            >
              <div className="py-1">
                <SettingsModal
                  trigger={
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-left">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                  }
                />
                <button
                  onClick={async () => {
                    const supabase = createClient(
                      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
                    )
                    await supabase.auth.signOut()
                    window.location.href = '/login'
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {collapsed && onToggleCollapse && (
           <button 
               onClick={onToggleCollapse}
               className="mt-2 flex w-full justify-center text-muted-foreground hover:text-white p-2 hover:bg-white/5 rounded-md transition-colors"
             >
               <ChevronRight className="h-4 w-4" />
           </button>
        )}
      </div>
    </aside>
  )
}
