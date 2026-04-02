'use client';
import useSWR from 'swr';
import { listUsers } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { UserSummary } from '@/types';

export function useUsers() {
  const { session, loading: authLoading } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    !authLoading && session ? 'users:list' : null,
    () => listUsers(),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );

  return {
    users: data ?? [] as UserSummary[],
    isLoading: authLoading || isLoading,
    error: error ?? null,
    refetch: () => mutate(),
  };
}
