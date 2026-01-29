'use client';

import { motion } from 'framer-motion';
import { RiskMeterProps } from '@/types';
import { getRiskColor, getRiskLabel, getRiskProgress } from '@/lib/colors';
import { cn } from '@/lib/utils';

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
            className="text-gray-200 dark:text-gray-800"
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
            className={cn('font-bold', font, colors.text)}
          >
            {label}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-xs text-muted-foreground mt-1"
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
        className="mt-4 text-center"
      >
        <div className="text-sm text-muted-foreground">Velocity</div>
        <div className={cn('text-2xl font-bold', colors.text)}>
          {velocity.toFixed(1)}
        </div>
      </motion.div>
    </div>
  );
}
