'use client';
import useSWR from 'swr';
import { TalentScoutData, UseNetworkDataReturn } from '@/types';
import { getNetworkAnalysis } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useNetworkData(userHash: string | null): UseNetworkDataReturn {
  const { session, loading: authLoading } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    !authLoading && session && userHash ? `network:${userHash}` : null,
    () => getNetworkAnalysis(userHash!),
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return {
    data: data ?? null,
    isLoading: authLoading || isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
