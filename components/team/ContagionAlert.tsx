'use client';

import { motion } from 'framer-motion';
import { RiskLevel } from '@/types';
import { getRiskColor, getRiskLabel } from '@/lib/colors';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContagionAlertProps {
  teamRisk: RiskLevel;
  criticalCount: number;
}

export function ContagionAlert({ teamRisk, criticalCount }: ContagionAlertProps) {
  if (teamRisk === 'LOW' || teamRisk === 'CALIBRATING') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 flex items-center gap-3"
      >
        <Info className="h-5 w-5 shrink-0" />
        <div>
          <div className="font-medium">Team Health: Good</div>
          <div className="text-sm opacity-90">No contagion risk detected.</div>
        </div>
      </motion.div>
    );
  }

  const riskColor = getRiskColor(teamRisk);
  const isCritical = teamRisk === 'CRITICAL';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-lg flex items-start gap-3',
        isCritical
          ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border-2 border-red-200'
          : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
      )}
    >
      {isCritical ? (
        <AlertTriangle className="h-6 w-6 shrink-0 animate-pulse" />
      ) : (
        <AlertCircle className="h-6 w-6 shrink-0" />
      )}
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">
            Contagion Risk: {getRiskLabel(teamRisk)}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              riskColor.bg,
              riskColor.text
            )}
          >
            {criticalCount} critical members
          </span>
        </div>
        
        <div className="text-sm opacity-90 mt-1">
          {isCritical
            ? 'Immediate intervention recommended. Multiple team members showing critical burnout indicators.'
            : 'Monitor team closely. Early signs of burnout contagion detected.'}
        </div>
      </div>
    </motion.div>
  );
}
