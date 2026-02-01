'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCardProps } from '@/types';
import { getRiskColor } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';

export function MetricCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon,
  status,
}: MetricCardProps) {
  const statusColor = status ? getRiskColor(status) : null;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        'transition-all duration-300 hover:shadow-lg border-none shadow-sm ring-1 ring-slate-900/5 bg-white group',
        statusColor?.subtle && `hover:${statusColor.subtle}`
      )}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
            {title}
          </CardTitle>
          {icon && (
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              statusColor ? `bg-${statusColor.base}-50 text-${statusColor.base}-600` : "bg-slate-50 text-slate-500"
            )}>
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              'text-2xl font-bold text-slate-900 tracking-tight',
              statusColor?.text
            )}>
              {typeof value === 'number' ? 
                (Number.isInteger(value) ? value : value.toFixed(2)) 
                : value
              }
            </span>
            {unit && (
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{unit}</span>
            )}
          </div>
          
          {trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{trendValue}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
