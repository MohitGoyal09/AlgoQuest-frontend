'use client';
import useSWR from 'swr';
import { SafetyValveData, UseRiskDataReturn } from '@/types';
import { getSafetyAnalysis } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useRiskData(userHash: string | null): UseRiskDataReturn {
  const { session, loading: authLoading } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    !authLoading && session && userHash ? `safety:${userHash}` : null,
    () => getSafetyAnalysis(userHash!),
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return {
    data: data ?? null,
    isLoading: authLoading || isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
