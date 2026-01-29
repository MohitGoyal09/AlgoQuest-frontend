'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCardProps } from '@/types';
import { getRiskColor } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
        'transition-all duration-200 hover:shadow-md',
        statusColor?.border && `border-l-4 ${statusColor.border}`
      )}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              'text-2xl font-bold',
              statusColor?.text
            )}>
              {typeof value === 'number' ? value.toFixed(2) : value}
            </span>
            {unit && (
              <span className="text-sm text-muted-foreground">{unit}</span>
            )}
          </div>
          
          {trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{trendValue}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
