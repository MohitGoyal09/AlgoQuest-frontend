import { api } from './api';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_hash: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  email?: string;
}

export async function createTenant(name: string): Promise<Tenant> {
  return api.post<Tenant>('/tenants', { name });
}

export async function getTenant(tenantId: string): Promise<Tenant> {
  return api.get<Tenant>(`/tenants/${tenantId}`);
}

export async function listTenantMembers(tenantId: string): Promise<TenantMember[]> {
  return api.get<TenantMember[]>(`/tenants/${tenantId}/members`);
}

export async function inviteMember(tenantId: string, email: string, role: string): Promise<TenantMember> {
  return api.post<TenantMember>(`/tenants/${tenantId}/members`, { email, role });
}

export async function updateMemberRole(tenantId: string, memberId: string, role: string): Promise<TenantMember> {
  return api.patch<TenantMember>(`/tenants/${tenantId}/members/${memberId}`, { role });
}

export async function removeMember(tenantId: string, memberId: string): Promise<void> {
  return api.delete(`/tenants/${tenantId}/members/${memberId}`);
}

export async function switchTenant(tenantId: string): Promise<{ access_token: string; tenant: Tenant }> {
  return api.post('/auth/switch-tenant', { tenant_id: tenantId });
}
