'use client';

import { motion } from 'framer-motion';
import { MemberListProps } from '@/types';
import { getRiskColor, getRiskLabel } from '@/lib/colors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TeamMemberList({ members }: MemberListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
            <Badge variant="secondary" className="ml-auto">
              {members.length} members
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member, index) => {
              const riskColor = getRiskColor(member.risk_level);
              
              return (
                <motion.div
                  key={member.user_hash}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all hover:shadow-md',
                    member.is_hidden_gem ? 'border-amber-200 bg-amber-50/50' : 'border-muted'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className={cn(
                      'h-10 w-10',
                      member.is_hidden_gem && 'ring-2 ring-amber-400'
                    )}>
                      <AvatarFallback className={riskColor.bg}>
                        {member.user_hash.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm truncate">
                          {member.user_hash.slice(0, 12)}...
                        </span>
                        {member.is_hidden_gem && (
                          <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', riskColor.bg, riskColor.text)}
                        >
                          {getRiskLabel(member.risk_level)}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        Betweenness: {member.betweenness.toFixed(3)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No team members found. Create personas to see team data.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
