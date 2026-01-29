'use client';

import { motion } from 'framer-motion';
import { CultureThermometerProps } from '@/types';
import { getRiskColor, getRiskLabel, getRiskProgress } from '@/lib/colors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Thermometer, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CultureThermometer({
  teamRisk,
  metrics,
  recommendation,
}: CultureThermometerProps) {
  const riskColor = getRiskColor(teamRisk);
  const progress = getRiskProgress(teamRisk);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('border-l-4', riskColor.border)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Culture Thermometer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Gauge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Team Risk Level</span>
              <Badge className={cn(riskColor.bg, riskColor.text)}>
                {getRiskLabel(teamRisk)}
              </Badge>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Avg Velocity</div>
              <div className="text-xl font-bold">{metrics.avg_velocity.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Critical Members</div>
              <div className={cn(
                'text-xl font-bold',
                metrics.critical_members > 0 ? 'text-red-500' : 'text-green-500'
              )}>
                {metrics.critical_members}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Fragmentation</div>
              <div className="text-xl font-bold">
                {(metrics.graph_fragmentation * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Comm Decay</div>
              <div className="text-xl font-bold">
                {(metrics.comm_decay_rate * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
              'p-4 rounded-lg flex items-start gap-3',
              teamRisk === 'CRITICAL' || teamRisk === 'ELEVATED'
                ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
                : 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
            )}
          >
            {teamRisk === 'CRITICAL' || teamRisk === 'ELEVATED' ? (
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-medium">Recommendation</div>
              <div className="text-sm opacity-90">{recommendation}</div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
