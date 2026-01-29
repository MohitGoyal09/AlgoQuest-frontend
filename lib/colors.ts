import { RiskLevel } from '@/types';

// ============================================
// Risk Level Colors (OKLCH)
// ============================================
export const riskColors = {
  CALIBRATING: {
    oklch: 'oklch(0.7 0 0)',
    bg: 'bg-gray-500',
    text: 'text-gray-500',
    border: 'border-gray-500',
    ring: 'ring-gray-500',
    hex: '#6b7280',
  },
  LOW: {
    oklch: 'oklch(0.6 0.15 145)',
    bg: 'bg-green-500',
    text: 'text-green-500',
    border: 'border-green-500',
    ring: 'ring-green-500',
    hex: '#22c55e',
  },
  ELEVATED: {
    oklch: 'oklch(0.7 0.15 85)',
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    ring: 'ring-yellow-500',
    hex: '#eab308',
  },
  CRITICAL: {
    oklch: 'oklch(0.6 0.2 25)',
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
    ring: 'ring-red-500',
    hex: '#ef4444',
  },
} as const;

export function getRiskColor(level: RiskLevel) {
  return riskColors[level] || riskColors.CALIBRATING;
}

export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    CALIBRATING: 'Calibrating',
    LOW: 'Low Risk',
    ELEVATED: 'Elevated',
    CRITICAL: 'Critical',
  };
  return labels[level] || level;
}

export function getRiskProgress(level: RiskLevel): number {
  const progress: Record<RiskLevel, number> = {
    CALIBRATING: 0,
    LOW: 25,
    ELEVATED: 60,
    CRITICAL: 90,
  };
  return progress[level] || 0;
}
