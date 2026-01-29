'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRiskColor, getRiskLabel } from '@/lib/colors';
import { RiskLevel } from '@/types';
import { Info } from 'lucide-react';

export function Legend() {
  const riskLevels: RiskLevel[] = ['CALIBRATING', 'LOW', 'ELEVATED', 'CRITICAL'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Legend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Level Colors */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Risk Level (Node Color)
            </h4>
            <div className="space-y-2">
              {riskLevels.map((level) => {
                const color = getRiskColor(level);
                return (
                  <div key={level} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm">{getRiskLabel(level)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Size */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Node Size (Betweenness Centrality)
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-xs">Low</span>
              <div className="w-5 h-5 rounded-full bg-gray-400" />
              <span className="text-xs">Medium</span>
              <div className="w-7 h-7 rounded-full bg-gray-400" />
              <span className="text-xs">High</span>
            </div>
          </div>

          {/* Hidden Gem */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Special Indicators
            </h4>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400 ring-2 ring-amber-400" />
              <span className="text-sm">Hidden Gem (High Potential)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
