'use client';
import useSWR from 'swr';
import { getTeamForecast } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface SIRForecastData {
  status: string;
  risk_level?: string;
  r0?: number;
  peak_day?: number;
  peak_infected?: number;
  forecast?: {
    days: number[];
    susceptible: number[];
    infected: number[];
    recovered: number[];
  };
}

interface UseForecastReturn {
  data: SIRForecastData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useForecast(teamHashes?: string[]): UseForecastReturn {
  const { session, loading: authLoading } = useAuth();

  const stableKey = !authLoading && session
    ? (teamHashes ? `forecast:${JSON.stringify(teamHashes.sort())}` : 'forecast:all')
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    stableKey,
    () => getTeamForecast(teamHashes || []),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );

  return {
    data: data ?? null,
    isLoading: authLoading || isLoading,
    error: error ?? null,
    refetch: async () => { await mutate(); },
  };
}
