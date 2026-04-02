'use client';
import useSWR from 'swr';
import { CultureThermometerData, UseTeamDataReturn } from '@/types';
import { getTeamAnalysis } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useTeamData(teamHashes?: string[]): UseTeamDataReturn {
  const { session, loading: authLoading } = useAuth();

  const stableKey = !authLoading && session
    ? (teamHashes ? `team:${JSON.stringify(teamHashes.sort())}` : 'team:all')
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    stableKey,
    () => getTeamAnalysis(teamHashes || []),
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return {
    data: data ?? null,
    isLoading: authLoading || isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
