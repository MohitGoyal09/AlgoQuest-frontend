'use client';
import useSWR from 'swr';
import { TalentScoutData, UseNetworkDataReturn } from '@/types';
import { getGlobalNetworkData } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useGlobalNetworkData(): UseNetworkDataReturn {
  const { session, loading: authLoading } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    !authLoading && session ? 'network:global' : null,
    () => getGlobalNetworkData(),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );

  return {
    data: data ?? null,
    isLoading: authLoading || isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
