'use client'

import { useState } from 'react'
import { useTenant } from '@/contexts/tenant-context'
import { createTenant, Tenant } from '@/lib/tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, Users, Check } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'

function TenantsPageContent() {
  const { tenants, currentTenant, switchTenant, refreshTenants } = useTenant()
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!newName.trim()) {
      setError('Workspace name is required')
      return
    }
    try {
      setCreating(true)
      setError('')
      const tenant = await createTenant(newName.trim())
      await refreshTenants()
      setNewName('')
      setCreateOpen(false)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create workspace')
    } finally {
      setCreating(false)
    }
  }

  const planBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default'
      case 'pro': return 'secondary'
      default: return 'outline'
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'suspended': return 'text-yellow-500'
      case 'cancelled': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground text-sm">Manage your workspaces and organizations.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Create a new workspace to organize your team and data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  placeholder="My Organization"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => {
          const isActive = currentTenant?.id === tenant.id
          return (
            <Card
              key={tenant.id}
              className={`cursor-pointer transition-colors hover:border-primary/50 ${isActive ? 'border-primary' : ''}`}
              onClick={() => !isActive && switchTenant(tenant.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{tenant.name}</CardTitle>
                  </div>
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </div>
                <CardDescription className="text-xs">{tenant.slug}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={planBadgeVariant(tenant.plan)}>{tenant.plan}</Badge>
                  <span className={`text-xs ${statusColor(tenant.status)}`}>{tenant.status}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {tenants.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No workspaces yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first workspace to get started.</p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function TenantsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <TenantsPageContent />
    </ProtectedRoute>
  )
}
