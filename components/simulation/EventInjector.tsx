'use client';

import { motion } from 'framer-motion';
import { EventInjectorProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRiskColor, getRiskLabel } from '@/lib/colors';
import { Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EventInjector({
  userHash,
  currentRisk,
  onInjectEvent,
  isLoading,
}: EventInjectorProps) {
  const riskColor = getRiskColor(currentRisk);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Event Injection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User */}
          <div>
            <label className="text-xs text-muted-foreground">Target User</label>
            <div className="font-mono text-sm truncate">{userHash || 'No user selected'}</div>
          </div>

          {/* Current Risk */}
          <div>
            <label className="text-xs text-muted-foreground">Current Risk Level</label>
            <div className="mt-1">
              <Badge className={cn(riskColor.bg, riskColor.text)}>
                {getRiskLabel(currentRisk)}
              </Badge>
            </div>
          </div>

          {/* Inject Button */}
          <Button
            onClick={() => onInjectEvent(userHash, currentRisk)}
            disabled={!userHash || isLoading}
            className="w-full"
            variant="secondary"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Injecting...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Inject Event
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Injects a simulated behavioral event and recalculates risk in real-time.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
