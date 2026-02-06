'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { PersonaCreator } from '@/components/simulation/PersonaCreator';
import { EventInjector } from '@/components/simulation/EventInjector';
import { ActivityFeed } from '@/components/simulation/ActivityFeed';
import { useSimulation } from '@/hooks/useSimulation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { PersonaType, RiskLevel } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SimulationPage() {
  const [userHash, setUserHash] = useState('demo_user_hash');
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>('ELEVATED');
  
  const { createPersona, injectEvent, isCreating, isInjecting, events } = useSimulation();
  const { connectionStatus, lastPing } = useWebSocket(userHash);

  const handleCreatePersona = async (personaType: PersonaType, email: string) => {
    try {
      const result = await createPersona(email, personaType);
      setUserHash(result.user_hash);
    } catch (error) {
      console.error('Failed to create persona:', error);
    }
  };

  const handleInjectEvent = async (hash: string, risk: RiskLevel) => {
    try {
      await injectEvent(hash, risk);
    } catch (error) {
      console.error('Failed to inject event:', error);
    }
  };

  return (
    <div>
      <Header
        title="Simulation Control Panel"
        description="Create personas and inject real-time events"
        connectionStatus={connectionStatus}
        lastPing={lastPing || undefined}
      />

      {/* Simulation Mode Badge */}
      <div className="mb-6">
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
          Simulation Mode Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PersonaCreator
            onCreatePersona={handleCreatePersona}
            isLoading={isCreating}
          />

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="targetUser">Target User Hash</Label>
                <Input
                  id="targetUser"
                  value={userHash}
                  onChange={(e) => setUserHash(e.target.value)}
                  placeholder="Enter user hash for event injection"
                />
              </div>
              <div>
                <Label htmlFor="riskLevel">Current Risk Level</Label>
                <Select value={currentRisk} onValueChange={(value) => setCurrentRisk(value as RiskLevel)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALIBRATING">Calibrating</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="ELEVATED">Elevated</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <EventInjector
            userHash={userHash}
            currentRisk={currentRisk}
            onInjectEvent={handleInjectEvent}
            isLoading={isInjecting}
          />
        </div>

        {/* Right Column */}
        <div>
          <ActivityFeed events={events} />
        </div>
      </div>
    </div>
  );
}
