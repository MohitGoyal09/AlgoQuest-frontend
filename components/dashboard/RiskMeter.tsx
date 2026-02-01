'use client';

import { motion } from 'framer-motion';
import { RiskMeterProps } from '@/types';
import { getRiskColor, getRiskLabel, getRiskProgress } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function RiskMeter({ riskLevel, velocity, confidence, size = 'md' }: RiskMeterProps) {
  const colors = getRiskColor(riskLevel);
  const progress = getRiskProgress(riskLevel);
  const label = getRiskLabel(riskLevel);

  const sizeConfig = {
    sm: { container: 120, stroke: 8, font: 'text-sm' },
    md: { container: 180, stroke: 12, font: 'text-base' },
    lg: { container: 240, stroke: 16, font: 'text-lg' },
  };

  const { container, stroke, font } = sizeConfig[size];
  const radius = (container - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStatusIcon = () => {
    switch (riskLevel) {
      case 'LOW':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'ELEVATED':
        return <Info className="h-5 w-5 text-amber-500" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: container, height: container }}>
        {/* Background circle */}
        <svg
          width={container}
          height={container}
          className="transform -rotate-90"
        >
          <circle
            cx={container / 2}
            cy={container / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-100"
          />
          {/* Progress circle */}
          <motion.circle
            cx={container / 2}
            cy={container / 2}
            r={radius}
            fill="none"
            stroke={colors.hex}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-2"
          >
            {getStatusIcon()}
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={cn('font-bold', font, colors.text)}
          >
            {label}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-xs text-slate-400 mt-1"
          >
            {Math.round(confidence * 100)}% confidence
          </motion.div>
        </div>
      </div>

      {/* Velocity indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="mt-6 text-center"
      >
        <div className="text-sm text-slate-500 mb-1">Velocity Score</div>
        <div className={cn('text-3xl font-bold', colors.text)}>
          {velocity.toFixed(1)}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {velocity < 1.5 ? 'Stable' : velocity < 2.5 ? 'Moderate' : 'High Risk'}
        </div>
      </motion.div>
    </div>
  );
}
