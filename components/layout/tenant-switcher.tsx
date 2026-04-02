'use client'

import { useTenant } from '@/contexts/tenant-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, Check, ChevronDown, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function TenantSwitcher() {
  const { currentTenant, tenants, switchTenant } = useTenant()
  const router = useRouter()

  if (!currentTenant) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between px-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{currentTenant.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => switchTenant(tenant.id)}
            className="flex items-center justify-between"
          >
            <span>{tenant.name}</span>
            {tenant.id === currentTenant.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/tenants')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
