'use client';
import useSWR from 'swr';
import { SimulationEvent } from '@/types';
import { getRecentEvents } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useRecentEvents(limit: number = 20) {
  const { session, loading: authLoading } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    !authLoading && session ? `events:recent:${limit}` : null,
    () => getRecentEvents(limit),
    { refreshInterval: 5000, revalidateOnFocus: false, dedupingInterval: 4000 }
  );

  return {
    events: data ?? [] as SimulationEvent[],
    isLoading: authLoading || isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
