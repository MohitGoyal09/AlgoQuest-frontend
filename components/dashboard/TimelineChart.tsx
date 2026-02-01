'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TimelineChartProps, RiskLevel } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRiskColor } from '@/lib/colors';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const riskLevelValues: Record<RiskLevel, number> = {
  CALIBRATING: 0,
  LOW: 1,
  ELEVATED: 2,
  CRITICAL: 3,
};

const riskLevelLabels: Record<number, string> = {
  0: 'Calibrating',
  1: 'Low',
  2: 'Elevated',
  3: 'Critical',
};

const riskLevelColors: Record<number, string> = {
  0: '#9ca3af',
  1: '#22c55e',
  2: '#f59e0b',
  3: '#ef4444',
};

export function TimelineChart({ data }: TimelineChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    riskValue: riskLevelValues[item.risk_level],
  }));

  // Calculate trend
  const firstValue = chartData[0]?.riskValue || 0;
  const lastValue = chartData[chartData.length - 1]?.riskValue || 0;
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';
  const trendPercent = firstValue > 0 ? Math.round(((lastValue - firstValue) / firstValue) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { risk_level: RiskLevel; velocity: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const colors = getRiskColor(data.risk_level);
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          <p className="text-sm text-slate-500 mb-2">
            {new Date(label || '').toLocaleString([], { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Risk:</span>
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: colors.hex, color: colors.hex }}
              >
                {data.risk_level}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Velocity:</span>
              <span className="text-sm font-medium text-slate-900">
                {data.velocity.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Risk History</CardTitle>
            <CardDescription>24-hour trend analysis</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' ? (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                <TrendingUp className="h-3 w-3" />
                +{trendPercent}%
              </Badge>
            ) : trend === 'down' ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                <TrendingDown className="h-3 w-3" />
                {trendPercent}%
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 gap-1">
                <Activity className="h-3 w-3" />
                Stable
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 3]}
                  ticks={[0, 1, 2, 3]}
                  tickFormatter={(value) => riskLevelLabels[value] || ''}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="riskValue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#riskGradient)"
                />
                <Line
                  type="stepAfter"
                  dataKey="riskValue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
