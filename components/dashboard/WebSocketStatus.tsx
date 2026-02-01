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
      label: 'Live',
      className: 'bg-green-500 hover:bg-green-500 text-white border-green-500',
      dotClass: 'bg-green-400',
    },
    connecting: {
      icon: Loader2,
      label: 'Connecting',
      className: 'bg-amber-500 hover:bg-amber-500 text-white border-amber-500',
      dotClass: 'bg-amber-400',
    },
    disconnected: {
      icon: WifiOff,
      label: 'Offline',
      className: 'bg-slate-500 hover:bg-slate-500 text-white border-slate-500',
      dotClass: 'bg-slate-400',
    },
  };

  const { icon: Icon, label, className, dotClass } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <Badge 
        variant="outline" 
        className={cn('gap-2 px-3 py-1 font-medium', className)}
      >
        <span className={cn('w-2 h-2 rounded-full animate-pulse', dotClass)} />
        <Icon className={cn('h-3 w-3', status === 'connecting' && 'animate-spin')} />
        {label}
      </Badge>
      {lastPing && status === 'connected' && (
        <span className="text-xs text-slate-400 hidden sm:inline">
          Updated {lastPing.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )}
    </motion.div>
  );
}
