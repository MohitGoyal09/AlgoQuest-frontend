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
} from 'recharts';
import { TimelineChartProps, RiskLevel } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRiskColor } from '@/lib/colors';

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

export function TimelineChart({ data }: TimelineChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    riskValue: riskLevelValues[item.risk_level],
  }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { risk_level: RiskLevel; velocity: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg border">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium">
            Risk: <span className={getRiskColor(data.risk_level).text}>
              {data.risk_level}
            </span>
          </p>
          <p className="text-sm">Velocity: {data.velocity.toFixed(2)}</p>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 3]}
                  ticks={[0, 1, 2, 3]}
                  tickFormatter={(value) => riskLevelLabels[value] || ''}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="stepAfter"
                  dataKey="riskValue"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#6b7280' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
