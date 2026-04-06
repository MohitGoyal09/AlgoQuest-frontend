'use client';
import useSWR from 'swr';
import { getBenchmarks } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useBenchmarks(industry: string = "tech") {
  const { session, loading: authLoading } = useAuth();

  const { data, error, isLoading } = useSWR(
    !authLoading && session ? `benchmarks:${industry}` : null,
    () => getBenchmarks(industry),
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    data: data ?? null,
    isLoading: authLoading || isLoading,
    error: error ?? null,
  };
}
