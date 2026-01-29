'use client';

import { motion } from 'framer-motion';
import { ConnectionStatusProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export function WebSocketStatus({ status, lastPing }: ConnectionStatusProps) {
  const config = {
    connected: {
      icon: Wifi,
      label: 'Connected',
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-500',
    },
    connecting: {
      icon: Loader2,
      label: 'Connecting...',
      variant: 'secondary' as const,
      className: 'animate-spin',
    },
    disconnected: {
      icon: WifiOff,
      label: 'Disconnected',
      variant: 'destructive' as const,
      className: '',
    },
  };

  const { icon: Icon, label, variant, className } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <Badge variant={variant} className={cn('gap-1.5', config[status].className)}>
        <Icon className={cn('h-3 w-3', className)} />
        {label}
      </Badge>
      {lastPing && status === 'connected' && (
        <span className="text-xs text-muted-foreground">
          Last ping: {lastPing.toLocaleTimeString()}
        </span>
      )}
    </motion.div>
  );
}
