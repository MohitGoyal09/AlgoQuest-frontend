'use client';

import { WebSocketStatus } from '@/components/dashboard/WebSocketStatus';
import { ConnectionStatus } from '@/types';
import { cn } from '@/lib/utils';

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
    <header className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6', className)}>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <WebSocketStatus status={connectionStatus} lastPing={lastPing} />
    </header>
  );
}
