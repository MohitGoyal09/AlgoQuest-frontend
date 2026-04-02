'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChevronsUpDown,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Network,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  Store,
  Thermometer,
  User,
  Users,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/contexts/tenant-context'
import { getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

type Role = 'employee' | 'manager' | 'admin'

// ---------------------------------------------------------------------------
// Navigation definitions
// ---------------------------------------------------------------------------

const NAV_COMMON: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'My Wellbeing', url: '/me', icon: User },
  { title: 'Ask Sentinel', url: '/ask-sentinel', icon: MessageCircle },
  { title: 'Privacy', url: '/privacy', icon: Shield },
]

const NAV_MANAGER: NavItem[] = [
  { title: 'My Team', url: '/team', icon: Users },
  { title: 'Team Health', url: '/team-health', icon: HeartPulse },
]

const NAV_ENGINES: NavItem[] = [
  { title: 'Safety Valve', url: '/engines/safety', icon: ShieldAlert },
  { title: 'Talent Scout', url: '/engines/talent', icon: Sparkles },
  { title: 'Network Graph', url: '/engines/network', icon: Network },
  { title: 'Culture', url: '/engines/culture', icon: Thermometer },
]

const NAV_ADMIN: NavItem[] = [
  { title: 'Admin Panel', url: '/admin', icon: Settings },
  { title: 'Data Pipeline', url: '/data-ingestion', icon: Zap },
  { title: 'Audit Log', url: '/audit-log', icon: FileText },
  { title: 'Marketplace', url: '/marketplace', icon: Store },
  { title: 'Simulation', url: '/simulation', icon: FlaskConical },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isActive(pathname: string, url: string): boolean {
  if (url === '/dashboard') {
    return pathname === '/dashboard'
  }
  return pathname === url || pathname.startsWith(`${url}/`)
}

function capitalize(value?: string | null): string {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function hasManagerAccess(role: Role): boolean {
  return role === 'manager' || role === 'admin'
}

function hasAdminAccess(role: Role): boolean {
  return role === 'admin'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, userRole, loading: authLoading, signOut } = useAuth()
  const { currentTenant, tenants, loading: tenantLoading, switchTenant } = useTenant()
  const pathname = usePathname()
  const router = useRouter()

  const isLoading = authLoading || tenantLoading
  const role = userRole?.role ?? 'employee'
  const roleResolved = !isLoading && userRole != null

  const visibleNav = useMemo(() => {
    const items = [...NAV_COMMON]

    if (roleResolved && hasManagerAccess(role)) {
      items.push(...NAV_MANAGER)
    }

    return items
  }, [role, roleResolved])

  const showEngines = roleResolved && hasManagerAccess(role)
  const showAdmin = roleResolved && hasAdminAccess(role)

  const email = user?.email ?? ''
  const initials = getInitials(email.split('@')[0]?.replace(/[._-]/g, ' ') || '?')

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ----------------------------------------------------------------- */}
      {/* Header: App branding                                               */}
      {/* ----------------------------------------------------------------- */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Sentinel">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Sentinel</span>
                  <span className="text-xs text-muted-foreground">Employee Insights</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ----------------------------------------------------------------- */}
      {/* Content: Navigation                                                */}
      {/* ----------------------------------------------------------------- */}
      <SidebarContent>
        {/* Common + Manager nav items */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {visibleNav.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(pathname, item.url)}
                  tooltip={item.title}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Engines group (manager + admin) */}
        {showEngines && (
          <SidebarGroup>
            <SidebarGroupLabel>Engines</SidebarGroupLabel>
            <SidebarMenu>
              {NAV_ENGINES.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(pathname, item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Admin group */}
        {showAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              {NAV_ADMIN.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(pathname, item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ----------------------------------------------------------------- */}
      {/* Footer: Tenant switcher + User menu                                */}
      {/* ----------------------------------------------------------------- */}
      <SidebarFooter>
        {/* Tenant switcher */}
        {isLoading ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="size-8 rounded-lg" />
                <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : tenants.length > 1 ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={currentTenant?.name ?? 'Switch tenant'}
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg border bg-background text-xs font-medium">
                      {getInitials(currentTenant?.name ?? '?')}
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-medium truncate">
                        {currentTenant?.name ?? 'No tenant'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {capitalize(currentTenant?.plan ?? 'free')}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                  align="start"
                  side="top"
                  sideOffset={4}
                >
                  <DropdownMenuLabel>Tenants</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {tenants.map((tenant) => (
                    <DropdownMenuItem
                      key={tenant.id}
                      onClick={() => switchTenant(tenant.id)}
                      className="gap-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border text-xs">
                        {getInitials(tenant.name)}
                      </div>
                      <div className="flex flex-col">
                        <span>{tenant.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {capitalize(tenant.plan ?? 'free')}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : currentTenant ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip={currentTenant.name}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg border bg-background text-xs font-medium">
                  {getInitials(currentTenant.name)}
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium truncate">{currentTenant.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {capitalize(currentTenant.plan ?? 'free')}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}

        <SidebarSeparator />

        {/* User menu */}
        {isLoading ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={email || 'Account'}
                  >
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-medium truncate">{email}</span>
                      <span className="text-xs text-muted-foreground">
                        {capitalize(role)}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                  align="start"
                  side="top"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="flex flex-col">
                    <span>{email}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {capitalize(role)}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/account')}>
                      <User className="mr-2 size-4" />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/privacy')}>
                      <Shield className="mr-2 size-4" />
                      Privacy
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
