import { api } from './api';

export interface UserSummary {
  user_hash: string;
  role: string;
  consent_share_with_manager: boolean;
  consent_share_anonymized: boolean;
  monitoring_paused: boolean;
  created_at: string;
}

export interface UsersListResponse {
  users: UserSummary[];
  total: number;
}

export async function listUsers(role?: string, search?: string, limit: number = 50, offset: number = 0): Promise<UsersListResponse> {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (search) params.set('search', search);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return api.get<UsersListResponse>(`/users/?${params.toString()}`);
}

export async function getUser(userHash: string): Promise<any> {
  return api.get(`/users/${userHash}`);
}

export async function updateUserRole(userHash: string, role: string): Promise<void> {
  return api.put(`/users/${userHash}/role`, { role });
}

export async function assignManager(userHash: string, managerHash: string): Promise<void> {
  return api.put(`/users/${userHash}/manager`, { manager_hash: managerHash });
}

export async function deactivateUser(userHash: string): Promise<void> {
  return api.delete(`/users/${userHash}`);
}

export async function exportUsersCSV(): Promise<void> {
  const { createClient } = await import('./supabase');
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const response = await fetch(`${API_BASE_URL}/users/export/csv`, {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
    },
  });

  if (!response.ok) throw new Error('Export failed');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sentinel_users_export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function downloadImportTemplate(): Promise<void> {
  const { createClient } = await import('./supabase');
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const response = await fetch(`${API_BASE_URL}/users/export/template`, {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
    },
  });

  if (!response.ok) throw new Error('Template download failed');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sentinel_user_import_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function importUsersCSV(file: File): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const { createClient } = await import('./supabase');
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const formData = new FormData();
  formData.append('file', file);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const response = await fetch(`${API_BASE_URL}/users/import/csv`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Import failed');
  }

  const result = await response.json();
  return result.data || result;
}
