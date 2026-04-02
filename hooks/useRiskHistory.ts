'use client';
import useSWR from 'swr';
import { getRiskHistory } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useRiskHistory(userHash: string | null) {
  const { session, loading: authLoading } = useAuth();

  const { data, error, isLoading } = useSWR(
    !authLoading && session && userHash && userHash !== 'undefined'
      ? `risk-history:${userHash}`
      : null,
    async () => {
      const response = await getRiskHistory(userHash!);
      return Array.isArray(response) ? response : (response as any)?.history || [];
    },
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return { history: data ?? [], isLoading: authLoading || isLoading, error: error ?? null };
}
