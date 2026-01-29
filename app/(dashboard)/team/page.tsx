'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CultureThermometer } from '@/components/team/CultureThermometer';
import { TeamMemberList } from '@/components/team/TeamMemberList';
import { ContagionAlert } from '@/components/team/ContagionAlert';
import { useTeamData } from '@/hooks/useTeamData';
import { useWebSocket } from '@/hooks/useWebSocket';
import { RiskLevel } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Sample team data for demo
const sampleTeamHashes = ['alex_hash', 'sarah_hash', 'jordan_hash', 'maria_hash'];

const sampleMembers = [
  { user_hash: 'alex_hash', risk_level: 'CRITICAL' as RiskLevel, betweenness: 0.8, is_hidden_gem: false },
  { user_hash: 'sarah_hash', risk_level: 'LOW' as RiskLevel, betweenness: 0.9, is_hidden_gem: true },
  { user_hash: 'jordan_hash', risk_level: 'ELEVATED' as RiskLevel, betweenness: 0.5, is_hidden_gem: false },
  { user_hash: 'maria_hash', risk_level: 'CRITICAL' as RiskLevel, betweenness: 0.3, is_hidden_gem: false },
];

const sampleMetrics = {
  avg_velocity: 2.1,
  critical_members: 2,
  graph_fragmentation: 0.34,
  comm_decay_rate: 0.12,
};

export default function TeamPage() {
  const [teamHashes, setTeamHashes] = useState<string[]>(sampleTeamHashes);
  const [inputHashes, setInputHashes] = useState(sampleTeamHashes.join(', '));
  
  const { data, isLoading, error, refetch } = useTeamData(teamHashes);
  const { connectionStatus, lastPing } = useWebSocket(teamHashes[0] || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hashes = inputHashes.split(',').map(h => h.trim()).filter(Boolean);
    setTeamHashes(hashes);
  };

  const teamRisk = data?.team_risk_level || 'ELEVATED' as RiskLevel;
  const metrics = data ? {
    avg_velocity: data.average_velocity,
    critical_members: data.critical_count,
    graph_fragmentation: data.graph_fragmentation,
    comm_decay_rate: data.communication_decay,
  } : sampleMetrics;
  const members = sampleMembers;

  return (
    <div>
      <Header
        title="Team Overview"
        description="Aggregate team risk analysis and contagion detection"
        connectionStatus={connectionStatus}
        lastPing={lastPing || undefined}
      />

      {/* Team Selection */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="teamHashes">Team Hashes (comma-separated)</Label>
              <Input
                id="teamHashes"
                value={inputHashes}
                onChange={(e) => setInputHashes(e.target.value)}
                placeholder="Enter team member hashes, separated by commas"
              />
            </div>
            <Button type="submit">Analyze Team</Button>
            <Button variant="outline" onClick={refetch}>
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
              <div className="font-medium">Error loading team data</div>
              <div className="text-sm">{error.message}</div>
            </div>
            <Button variant="outline" size="sm" onClick={refetch} className="ml-auto">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contagion Alert */}
      <div className="mb-6">
        <ContagionAlert teamRisk={teamRisk} criticalCount={metrics.critical_members} />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[400px]" />
        </div>
      ) : (
        <div className="space-y-6">
          <CultureThermometer
            teamRisk={teamRisk}
            metrics={metrics}
          />

          <TeamMemberList members={members} />
        </div>
      )}
    </div>
  );
}
