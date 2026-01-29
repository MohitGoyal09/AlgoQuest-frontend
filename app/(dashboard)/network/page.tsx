'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { NetworkGraph } from '@/components/network/NetworkGraph';
import { NodeDetails } from '@/components/network/NodeDetails';
import { Legend } from '@/components/network/Legend';
import { useNetworkData } from '@/hooks/useNetworkData';
import { useWebSocket } from '@/hooks/useWebSocket';
import { NetworkNode, RiskLevel } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Sample network data for demo
const sampleNodes: NetworkNode[] = [
  { id: '1', user_hash: 'alex_hash', risk_level: 'CRITICAL', betweenness: 0.8, eigenvector: 0.6, is_hidden_gem: false },
  { id: '2', user_hash: 'sarah_hash', risk_level: 'LOW', betweenness: 0.9, eigenvector: 0.9, is_hidden_gem: true },
  { id: '3', user_hash: 'jordan_hash', risk_level: 'ELEVATED', betweenness: 0.5, eigenvector: 0.4, is_hidden_gem: false },
  { id: '4', user_hash: 'maria_hash', risk_level: 'CRITICAL', betweenness: 0.3, eigenvector: 0.2, is_hidden_gem: false },
  { id: '5', user_hash: 'tom_hash', risk_level: 'LOW', betweenness: 0.4, eigenvector: 0.5, is_hidden_gem: false },
];

const sampleEdges = [
  { source: '1', target: '2', weight: 3 },
  { source: '2', target: '3', weight: 2 },
  { source: '3', target: '4', weight: 1 },
  { source: '1', target: '4', weight: 2 },
  { source: '2', target: '5', weight: 2 },
  { source: '3', target: '5', weight: 1 },
];

export default function NetworkPage() {
  const [userHash, setUserHash] = useState('demo_user_hash');
  const [inputHash, setInputHash] = useState('demo_user_hash');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  
  const { data, isLoading, error, refetch } = useNetworkData(userHash);
  const { connectionStatus, lastPing } = useWebSocket(userHash);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserHash(inputHash);
  };

  // Use sample data if no real data available
  // API returns single user network data, create a node from it
  const nodes: NetworkNode[] = data ? [{
    id: '1',
    user_hash: data.user_hash,
    risk_level: (data.is_hidden_gem ? 'LOW' : 'ELEVATED') as RiskLevel,
    betweenness: data.betweenness,
    eigenvector: data.eigenvector,
    is_hidden_gem: data.is_hidden_gem,
  }] : sampleNodes;

  return (
    <div>
      <Header
        title="Network Visualization"
        description="Team connectivity and hidden gem identification"
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
            <Button type="submit">Load Network</Button>
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
              <div className="font-medium">Error loading network data</div>
              <div className="text-sm">{error.message}</div>
            </div>
            <Button variant="outline" size="sm" onClick={refetch} className="ml-auto">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <Skeleton className="h-[600px] w-full" />
          ) : (
            <NetworkGraph
              nodes={nodes}
              edges={sampleEdges}
              onNodeClick={setSelectedNode}
              selectedNode={selectedNode?.id || null}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Legend />
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <NodeDetails
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
