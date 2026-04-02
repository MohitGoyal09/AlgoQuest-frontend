import { api } from './api';

export interface SSOProvider {
  name: string;
  display_name: string;
}

export interface SSOProvidersResponse {
  providers: SSOProvider[];
}

export async function getSSOProviders(): Promise<SSOProvider[]> {
  const response = await api.get<SSOProvidersResponse>('/sso/providers');
  return response.providers || [];
}

export async function initiateSSOLogin(provider: string): Promise<{ auth_url: string; state: string }> {
  const result = await api.get<{ auth_url: string; state: string }>(`/sso/${provider}/login?redirect_uri=${encodeURIComponent(window.location.origin + '/auth/sso/callback')}`);
  if (result.state) {
    sessionStorage.setItem('sso_state', result.state);
  }
  return result;
}

export async function handleSSOCallback(provider: string, code: string, state: string): Promise<any> {
  return api.post(`/sso/${provider}/callback`, { code, state });
}
