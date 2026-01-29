'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ActivityFeedProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Clock } from 'lucide-react';

export function ActivityFeed({ events, maxItems = 50 }: ActivityFeedProps) {
  const displayEvents = events.slice(0, maxItems);

  const getEventTypeColor = (eventType: string): string => {
    if (eventType.includes('after_hours')) return 'bg-red-100 text-red-700';
    if (eventType.includes('weekend')) return 'bg-orange-100 text-orange-700';
    if (eventType.includes('message')) return 'bg-blue-100 text-blue-700';
    if (eventType.includes('pr')) return 'bg-green-100 text-green-700';
    if (eventType.includes('meeting')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
            <Badge variant="secondary" className="ml-auto">
              {events.length} events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {displayEvents.map((event, index) => (
                  <motion.div
                    key={`${event.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {event.user_hash.slice(0, 8)}...
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getEventTypeColor(event.event_type)}`}
                        >
                          {event.event_type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </div>
                    </div>

                    {event.metadata && (
                      <div className="text-xs text-muted-foreground">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {displayEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No events yet. Create a persona or inject events to see activity.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
