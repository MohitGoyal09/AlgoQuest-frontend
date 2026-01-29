'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { RiskMeter } from '@/components/dashboard/RiskMeter';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TimelineChart } from '@/components/dashboard/TimelineChart';
import { useRiskData } from '@/hooks/useRiskData';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Clock, AlertCircle, RefreshCw } from 'lucide-react';

// Sample timeline data for demo
const sampleTimelineData = [
  { timestamp: '2026-01-29T10:00:00Z', risk_level: 'LOW' as const, velocity: 1.2 },
  { timestamp: '2026-01-29T11:00:00Z', risk_level: 'LOW' as const, velocity: 1.5 },
  { timestamp: '2026-01-29T12:00:00Z', risk_level: 'ELEVATED' as const, velocity: 2.1 },
  { timestamp: '2026-01-29T13:00:00Z', risk_level: 'ELEVATED' as const, velocity: 2.8 },
  { timestamp: '2026-01-29T14:00:00Z', risk_level: 'CRITICAL' as const, velocity: 3.5 },
];

export default function DashboardPage() {
  const [userHash, setUserHash] = useState('demo_user_hash');
  const [inputHash, setInputHash] = useState('demo_user_hash');
  
  const { data, isLoading, error, refetch } = useRiskData(userHash);
  const { connectionStatus, lastPing, requestUpdate } = useWebSocket(userHash);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserHash(inputHash);
  };

  return (
    <div>
      <Header
        title="Personal Risk Dashboard"
        description="Real-time burnout risk monitoring"
        connectionStatus={connectionStatus}
        lastPing={lastPing || undefined}
      />

      {/* User Selection */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="userHash">User Hash</Label>
              <Input
                id="userHash"
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                placeholder="Enter user hash"
              />
            </div>
            <Button type="submit">Load User</Button>
            <Button variant="outline" onClick={requestUpdate} disabled={connectionStatus !== 'connected'}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">Error loading data</div>
              <div className="text-sm">{error.message}</div>
            </div>
            <Button variant="outline" size="sm" onClick={refetch} className="ml-auto">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-[120px]" />
              <Skeleton className="h-[120px]" />
              <Skeleton className="h-[120px]" />
            </div>
            <Skeleton className="h-[200px]" />
          </div>
        </div>
      )}

      {/* Data Display */}
      {data && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Meter */}
          <div className="lg:col-span-1">
            <Card className="h-full flex items-center justify-center p-6">
              <RiskMeter
                riskLevel={data.risk_level}
                velocity={data.velocity}
                confidence={data.confidence}
                size="lg"
              />
            </Card>
          </div>

          {/* Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                title="Belongingness Score"
                value={data.belongingness_score}
                icon={<Heart className="h-4 w-4" />}
                status={data.risk_level}
              />
              <MetricCard
                title="Circadian Entropy"
                value={data.circadian_entropy}
                icon={<Clock className="h-4 w-4" />}
                status={data.risk_level}
              />
              <MetricCard
                title="Indicators"
                value={Object.values(data.indicators).filter(Boolean).length}
                unit={`/ ${Object.keys(data.indicators).length}`}
                icon={<AlertCircle className="h-4 w-4" />}
                status={data.risk_level}
              />
            </div>

            <TimelineChart data={sampleTimelineData} />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !isLoading && !error && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground">
              No data available. Enter a user hash to view risk analysis.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
