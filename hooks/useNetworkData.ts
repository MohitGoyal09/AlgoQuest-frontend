'use client';

import { useState, useEffect, useCallback } from 'react';
import { TalentScoutData, UseNetworkDataReturn } from '@/types';
import { getNetworkAnalysis } from '@/lib/api';

/**
 * Hook for fetching and managing talent scout (network centrality) data
 * 
 * GET /users/{user_hash}/talent
 * 
 * Response includes:
 * - betweenness: Network betweenness centrality score
 * - eigenvector: Eigenvector centrality score
 * - unblocking_count: Number of unblocking actions
 * - knowledge_transfer_score: Knowledge transfer metric
 * - is_hidden_gem: Whether user is a hidden gem
 */
export function useNetworkData(userHash: string | null): UseNetworkDataReturn {
  const [data, setData] = useState<TalentScoutData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userHash) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getNetworkAnalysis(userHash);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch network analysis';
      setError(new Error(errorMessage));
      console.error('Error fetching network analysis:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userHash]);

  // Fetch data when userHash changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    isLoading, 
    error, 
    refetch: fetchData,
  };
}
