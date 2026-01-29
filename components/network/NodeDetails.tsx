'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { NetworkNode } from '@/types';
import { getRiskColor, getRiskLabel } from '@/lib/colors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, User, Activity, Network, Sparkles } from 'lucide-react';

interface NodeDetailsProps {
  node: NetworkNode | null;
  onClose: () => void;
}

export function NodeDetails({ node, onClose }: NodeDetailsProps) {
  if (!node) return null;

  const riskColor = getRiskColor(node.risk_level);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3 }}
        className="fixed right-0 top-0 h-full w-80 z-50 p-4"
      >
        <Card className="h-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Node Details
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* User Hash */}
            <div>
              <label className="text-xs text-muted-foreground">User Hash</label>
              <div className="font-mono text-sm truncate">{node.user_hash}</div>
            </div>

            <Separator />

            {/* Risk Level */}
            <div>
              <label className="text-xs text-muted-foreground">Risk Level</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={riskColor.bg}>
                  {getRiskLabel(node.risk_level)}
                </Badge>
              </div>
            </div>

            {/* Hidden Gem Badge */}
            {node.is_hidden_gem && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200"
              >
                <Sparkles className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="font-medium text-amber-700 dark:text-amber-300">Hidden Gem</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    High network centrality detected
                  </div>
                </div>
              </motion.div>
            )}

            <Separator />

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Network Metrics</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Betweenness</div>
                  <div className="text-lg font-semibold">
                    {node.betweenness.toFixed(3)}
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Eigenvector</div>
                  <div className="text-lg font-semibold">
                    {node.eigenvector.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Activity Indicator */}
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Real-time monitoring active
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
