'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Tenant, TenantMember } from '@/lib/tenant';
import { useAuth } from './auth-context';
import { api, setCurrentTenantId } from '@/lib/api';

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  members: TenantMember[];
  loading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTenants = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await api.get<any>('/auth/me');
      // Unwrap success_response envelope: { success, data: { tenants, ... } }
      const meData = raw?.data ?? raw;
      const tenantList = meData?.tenants ?? [];
      if (tenantList.length > 0) {
        setTenants(tenantList);
        // Keep the currently selected tenant if it still exists in the list, otherwise use the first
        setCurrentTenant(prev => {
          const stillValid = prev ? tenantList.find((t: Tenant) => t.id === prev.id) : null;
          return stillValid ?? tenantList[0];
        });
      }
    } catch {
      // tenant fetch failed — user may not have tenants yet
    } finally {
      setLoading(false);
    }
  }, []);

  // Use session?.access_token (a stable string) instead of session (a new object
  // reference on every onAuthStateChange event) to prevent unnecessary re-fetches.
  const accessToken = session?.access_token;
  useEffect(() => {
    if (user && accessToken) {
      refreshTenants();
    } else {
      setTenants([]);
      setCurrentTenant(null);
      setCurrentTenantId(null);
      setLoading(false);
    }
  }, [user, accessToken, refreshTenants]);

  // Sync current tenant ID to the API module for X-Tenant-ID header
  useEffect(() => {
    setCurrentTenantId(currentTenant?.id ?? null);
  }, [currentTenant]);

  const switchTenant = async (tenantId: string) => {
    try {
      const raw = await api.post<any>('/auth/switch-tenant', { tenant_id: tenantId });
      // Unwrap success_response envelope
      const result = raw?.data ?? raw;
      if (result?.tenant_id) {
        const tenant: Tenant = {
          id: result.tenant_id,
          name: result.tenant_name || result.tenant_id,
          slug: result.tenant_slug || '',
          plan: 'free',
          status: 'active',
          settings: {},
          created_at: '',
          updated_at: '',
        };
        setCurrentTenant(tenant);
      }
      // Refresh data with new tenant context instead of full page reload
      await refreshTenants();
    } catch (err) {
      throw err;
    }
  };

  return (
    <TenantContext.Provider value={{ currentTenant, tenants, members, loading, switchTenant, refreshTenants }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
