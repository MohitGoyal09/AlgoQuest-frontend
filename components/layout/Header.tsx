'use client';

import { WebSocketStatus } from '@/components/dashboard/WebSocketStatus';
import { ConnectionStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Search,
  Plus,
  Calendar,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
  connectionStatus: ConnectionStatus;
  lastPing?: Date;
  className?: string;
}

export function Header({
  title,
  description,
  connectionStatus,
  lastPing,
  className,
}: HeaderProps) {
  return (
    <header className={cn('flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6', className)}>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Live
          </Badge>
        </div>
        {description && (
          <p className="text-slate-500 mt-1">{description}</p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <WebSocketStatus status={connectionStatus} lastPing={lastPing} />
        
        <div className="h-6 w-px bg-slate-200 mx-1" />
        
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            2
          </span>
        </Button>
        
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>
    </header>
  );
}
