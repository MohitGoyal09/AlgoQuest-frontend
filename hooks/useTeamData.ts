'use client';

import { useState, useEffect, useCallback } from 'react';
import { CultureThermometerData, UseTeamDataReturn } from '@/types';
import { getTeamAnalysis } from '@/lib/api';

/**
 * Hook for fetching and managing team culture/contagion analysis data
 * 
 * POST /teams/culture
 * Body: { user_hashes: string[] }
 * 
 * Response includes:
 * - team_risk_level: Overall team risk level
 * - average_velocity: Team average velocity
 * - graph_fragmentation: Network fragmentation metric
 * - communication_decay: Communication decay rate
 * - critical_count: Number of critical risk members
 * - elevated_count: Number of elevated risk members
 * - contagion_risk: Contagion risk score
 */
export function useTeamData(teamHashes: string[]): UseTeamDataReturn {
  const [data, setData] = useState<CultureThermometerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (teamHashes.length === 0) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getTeamAnalysis(teamHashes);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team analysis';
      setError(new Error(errorMessage));
      console.error('Error fetching team analysis:', err);
    } finally {
      setIsLoading(false);
    }
  }, [teamHashes]);

  // Fetch data when teamHashes changes
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
