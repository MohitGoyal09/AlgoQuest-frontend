'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PersonaCreatorProps, PersonaType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, UserCog, UserCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const personas: { type: PersonaType; label: string; description: string; icon: typeof User; color: string }[] = [
  {
    type: 'alex_burnout',
    label: 'Alex: Burnout Risk',
    description: 'High velocity, declining patterns',
    icon: UserCog,
    color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
  },
  {
    type: 'sarah_gem',
    label: 'Sarah: Hidden Gem',
    description: 'Low visibility, high impact',
    icon: UserCheck,
    color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
  },
  {
    type: 'jordan_steady',
    label: 'Jordan: Steady',
    description: 'Consistent, balanced patterns',
    icon: User,
    color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
  },
];

export function PersonaCreator({ onCreatePersona, isLoading }: PersonaCreatorProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [email, setEmail] = useState('');

  const handleCreate = async () => {
    if (!selectedPersona || !email) return;
    await onCreatePersona(selectedPersona, email);
    setEmail('');
    setSelectedPersona(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create Persona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Persona Selection */}
          <div className="grid gap-3">
            {personas.map((persona) => {
              const Icon = persona.icon;
              const isSelected = selectedPersona === persona.type;
              
              return (
                <motion.button
                  key={persona.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPersona(persona.type)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                    persona.color,
                    isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : 'opacity-80'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">{persona.label}</div>
                    <div className="text-xs opacity-80">{persona.description}</div>
                  </div>
                  {isSelected && (
                    <Badge variant="outline">Selected</Badge>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="person@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={!selectedPersona || !email || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Persona'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
