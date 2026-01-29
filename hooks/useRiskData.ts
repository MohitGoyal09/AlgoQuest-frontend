'use client';

import { useState, useEffect, useCallback } from 'react';
import { SafetyValveData, UseRiskDataReturn } from '@/types';
import { getSafetyAnalysis } from '@/lib/api';
import { useWebSocket } from './useWebSocket';

/**
 * Hook for fetching and managing safety valve (burnout risk) data
 * 
 * Fetches initial data via REST API and listens for real-time updates via WebSocket
 * GET /users/{user_hash}/safety
 * 
 * WebSocket updates:
 * - type: 'risk_update' - Real-time risk level changes
 * - type: 'manual_refresh' - Manual refresh response with full data
 */
export function useRiskData(userHash: string | null): UseRiskDataReturn {
  const [data, setData] = useState<SafetyValveData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { lastMessage, connectionStatus } = useWebSocket(userHash);

  const fetchData = useCallback(async () => {
    if (!userHash) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getSafetyAnalysis(userHash);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch safety analysis';
      setError(new Error(errorMessage));
      console.error('Error fetching safety analysis:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userHash]);

  // Initial fetch when userHash changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for WebSocket updates
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'risk_update':
        // Partial update with new risk data
        if (lastMessage.data) {
          setData((prev) => {
            if (!prev) return lastMessage.data as SafetyValveData;
            return { ...prev, ...lastMessage.data };
          });
        }
        break;
      
      case 'manual_refresh':
        // Full data refresh
        if (lastMessage.data) {
          setData(lastMessage.data);
        }
        break;
      
      case 'error':
        setError(new Error('WebSocket error received'));
        break;
    }
  }, [lastMessage]);

  return { 
    data, 
    isLoading, 
    error, 
    refetch: fetchData,
  };
}
