'use client';
import useSWR from 'swr';
import { getNudge } from '@/lib/api';
import { NudgeData } from '@/types';
import { useAuth } from '@/contexts/auth-context';

export function useNudge(userHash: string | null) {
  const { session, loading: authLoading } = useAuth();

  const { data, isLoading, error } = useSWR(
    !authLoading && session && userHash ? `nudge:${userHash}` : null,
    () => getNudge(userHash!),
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return { data: data ?? null, isLoading: authLoading || isLoading, error: error ?? null };
}
