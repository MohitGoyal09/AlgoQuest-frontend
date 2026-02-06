'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { RiskMeter } from '@/components/dashboard/RiskMeter';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TimelineChart } from '@/components/dashboard/TimelineChart';
import { useRiskData } from '@/hooks/useRiskData';
import { listUsers, getRiskHistory, getNudge } from '@/lib/api';
import { getRiskColor } from '@/lib/colors';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Heart,
  Clock,
  AlertCircle,
  RefreshCw,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Zap,
  ArrowUpRight,
  MoreHorizontal,
  Sparkles,
  UserCheck,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import type { RiskLevel } from '@/types';
import Link from 'next/link';

// ============================================
// Types
// ============================================
interface UserEntry {
  user_hash: string;
  risk_level: string;
  velocity: number;
  confidence: number;
  updated_at: string | null;
}

interface HistoryEntry {
  timestamp: string;
  risk_level: string;
  velocity: number;
  confidence: number;
  belongingness_score: number;
}

interface ActivityItem {
  id: string;
  type: 'risk_change' | 'nudge' | 'status';
  message: string;
  time: string;
  severity: 'high' | 'medium' | 'low' | 'info';
}

// ============================================
// Helpers
// ============================================
function getRiskBadgeColor(riskLevel: string) {
  switch (riskLevel) {
    case 'LOW':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    case 'ELEVATED':
      return 'bg-amber-50 text-amber-700 border-amber-200/60';
    case 'CRITICAL':
      return 'bg-red-50 text-red-700 border-red-200/60';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200/60';
  }
}

function getRiskDotColor(riskLevel: string) {
  switch (riskLevel) {
    case 'LOW':
      return 'bg-emerald-500';
    case 'ELEVATED':
      return 'bg-amber-500';
    case 'CRITICAL':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
}

function getTrendIcon(velocity: number, prevVelocity?: number) {
  if (prevVelocity === undefined) return <Activity className="h-4 w-4 text-slate-400" />;
  if (velocity > prevVelocity + 0.2) return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (velocity < prevVelocity - 0.2) return <TrendingDown className="h-4 w-4 text-emerald-500" />;
  return <Activity className="h-4 w-4 text-slate-400" />;
}

function abbreviateHash(hash: string): string {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function getInitials(hash: string): string {
  return hash.slice(0, 2).toUpperCase();
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

// ============================================
// Animation Variants
// ============================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

// ============================================
// Sub-Components
// ============================================

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/60 backdrop-blur-sm p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Selector skeleton */}
      <Skeleton className="h-16 w-full rounded-2xl" />
      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Skeleton className="h-[380px] rounded-2xl" />
          <Skeleton className="h-[120px] rounded-2xl" />
          <Skeleton className="h-[120px] rounded-2xl" />
          <Skeleton className="h-[120px] rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[340px] rounded-2xl" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Skeleton className="h-[320px] rounded-2xl" />
            <Skeleton className="h-[320px] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden text-center py-20 border-dashed border-2 border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent" />
        <CardContent className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-lg shadow-blue-100/50 ring-1 ring-blue-200/30 flex items-center justify-center mb-6"
          >
            <Sparkles className="h-9 w-9 text-blue-500" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-slate-900"
          >
            No Personas Yet
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 max-w-md mx-auto mt-3 text-sm leading-relaxed"
          >
            Create your first simulation persona to start monitoring employee well-being
            and risk metrics in real-time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Link href="/simulation">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200/50 px-8">
                <Sparkles className="h-4 w-4" />
                Go to Simulation
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// Main Dashboard Page
// ============================================
export default function DashboardPage() {
  // --- State ---
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);

  // useRiskData internally manages WebSocket -- do NOT call useWebSocket separately
  const { data: riskData, isLoading: riskLoading, error: riskError, refetch: refetchRisk } = useRiskData(selectedHash);

  // --- Fetch users on mount ---
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const result = await listUsers();
      setUsers(result);
      // Auto-select the first user if none selected
      if (result.length > 0 && !selectedHash) {
        setSelectedHash(result[0].user_hash);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load users';
      setUsersError(msg);
    } finally {
      setUsersLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Fetch risk history when selected user changes ---
  useEffect(() => {
    if (!selectedHash) {
      setHistoryData([]);
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);

    getRiskHistory(selectedHash, 30)
      .then((result) => {
        if (!cancelled) {
          setHistoryData(result);
        }
      })
      .catch(() => {
        if (!cancelled) setHistoryData([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedHash]);

  // --- Fetch nudge for selected user ---
  useEffect(() => {
    if (!selectedHash) {
      setNudgeMessage(null);
      return;
    }

    let cancelled = false;

    getNudge(selectedHash)
      .then((result) => {
        if (!cancelled) setNudgeMessage(result.message);
      })
      .catch(() => {
        if (!cancelled) setNudgeMessage(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedHash]);

  // --- Derived stats from real user data ---
  const stats = useMemo(() => {
    const total = users.length;
    const low = users.filter((u) => u.risk_level === 'LOW').length;
    const elevated = users.filter((u) => u.risk_level === 'ELEVATED').length;
    const critical = users.filter((u) => u.risk_level === 'CRITICAL').length;
    const calibrating = users.filter((u) => u.risk_level === 'CALIBRATING').length;
    const avgVelocity = total > 0 ? users.reduce((sum, u) => sum + u.velocity, 0) / total : 0;

    return { total, low, elevated, critical, calibrating, avgVelocity };
  }, [users]);

  // --- Build activity feed from real data ---
  const activityFeed = useMemo((): ActivityItem[] => {
    const items: ActivityItem[] = [];

    // Create activity items from users sorted by most recently updated
    const sortedUsers = [...users]
      .filter((u) => u.updated_at)
      .sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime())
      .slice(0, 6);

    sortedUsers.forEach((user, idx) => {
      const hash = abbreviateHash(user.user_hash);
      if (user.risk_level === 'CRITICAL') {
        items.push({
          id: `act-${idx}-critical`,
          type: 'risk_change',
          message: `${hash} flagged as Critical risk`,
          time: timeAgo(user.updated_at),
          severity: 'high',
        });
      } else if (user.risk_level === 'ELEVATED') {
        items.push({
          id: `act-${idx}-elevated`,
          type: 'risk_change',
          message: `${hash} risk level at Elevated`,
          time: timeAgo(user.updated_at),
          severity: 'medium',
        });
      } else {
        items.push({
          id: `act-${idx}-status`,
          type: 'status',
          message: `${hash} status updated to ${user.risk_level}`,
          time: timeAgo(user.updated_at),
          severity: user.risk_level === 'LOW' ? 'low' : 'info',
        });
      }
    });

    // Add a nudge activity if we have one
    if (nudgeMessage && selectedHash) {
      items.unshift({
        id: 'nudge-active',
        type: 'nudge',
        message: `Nudge for ${abbreviateHash(selectedHash)}: ${nudgeMessage.slice(0, 80)}${nudgeMessage.length > 80 ? '...' : ''}`,
        time: 'Active',
        severity: 'medium',
      });
    }

    return items.slice(0, 5);
  }, [users, nudgeMessage, selectedHash]);

  // --- Timeline data for chart (cast risk_level to RiskLevel) ---
  const timelineData = useMemo(() => {
    return historyData.map((h) => ({
      timestamp: h.timestamp,
      risk_level: h.risk_level as RiskLevel,
      velocity: h.velocity,
    }));
  }, [historyData]);

  // --- Connection status derived from useRiskData's internal WebSocket ---
  // The useRiskData hook calls useWebSocket internally, so we infer status from
  // loading/error/data states rather than creating a duplicate WebSocket connection.
  const connectionStatus = riskLoading
    ? 'connecting' as const
    : riskError
    ? 'disconnected' as const
    : riskData
    ? 'connected' as const
    : 'disconnected' as const;

  // --- Handle user selection ---
  const handleUserSelect = (hash: string) => {
    setSelectedHash(hash);
  };

  // --- Handle refresh ---
  const handleRefresh = () => {
    fetchUsers();
    refetchRisk();
  };

  // --- Render ---
  // Full loading state on initial load
  if (usersLoading && users.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Header
          title="Dashboard Overview"
          description="Monitor team health, risks, and key metrics"
          connectionStatus="connecting"
        />
        <DashboardSkeleton />
      </div>
    );
  }

  // Empty state - no users at all
  if (!usersLoading && users.length === 0 && !usersError) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Header
          title="Dashboard Overview"
          description="Monitor team health, risks, and key metrics"
          connectionStatus="disconnected"
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Header
        title="Dashboard Overview"
        description="Monitor team health, risks, and key metrics"
        connectionStatus={connectionStatus}
        lastPing={riskData ? new Date() : undefined}
      />

      {/* ========== Stats Overview with Glassmorphism ========== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Members */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-500 border border-white/30 shadow-sm bg-white/60 backdrop-blur-md ring-1 ring-slate-900/[0.04] group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-indigo-500/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Total Members</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-500">
                <UserCheck className="h-3 w-3 mr-1 text-emerald-500" />
                <span className="text-emerald-600 font-medium">{stats.low} healthy</span>
                <span className="mx-1.5 text-slate-300">|</span>
                <span className="text-slate-400">{stats.calibrating} calibrating</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Elevated */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-500 border border-white/30 shadow-sm bg-white/60 backdrop-blur-md ring-1 ring-slate-900/[0.04] group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-80" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 group-hover:text-amber-600 transition-colors">Elevated Risk</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stats.elevated}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-500">
                <span className="text-amber-600 font-medium">Monitoring</span>
                <span className="ml-1">actively</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Critical */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-500 border border-white/30 shadow-sm bg-white/60 backdrop-blur-md ring-1 ring-slate-900/[0.04] group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-rose-500/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500 opacity-80" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 group-hover:text-red-600 transition-colors">Critical</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stats.critical}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                {stats.critical > 0 ? (
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    Requires immediate attention
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium">All clear</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Velocity */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-500 border border-white/30 shadow-sm bg-white/60 backdrop-blur-md ring-1 ring-slate-900/[0.04] group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-teal-500/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">Avg Velocity</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stats.avgVelocity.toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Zap className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-500">
                {stats.avgVelocity < 1.5 ? (
                  <>
                    <TrendingDown className="h-3 w-3 mr-1 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">Healthy range</span>
                  </>
                ) : stats.avgVelocity < 2.5 ? (
                  <>
                    <Activity className="h-3 w-3 mr-1 text-amber-500" />
                    <span className="text-amber-600 font-medium">Moderate</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                    <span className="text-red-600 font-medium">Elevated</span>
                  </>
                )}
                <span className="ml-1 text-slate-400">across team</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ========== User Selector Bar ========== */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/60 shadow-sm ring-1 ring-slate-900/[0.03]"
      >
        <div className="flex-1 flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">Viewing</span>
          </div>
          <Select value={selectedHash || ''} onValueChange={handleUserSelect}>
            <SelectTrigger className="w-full max-w-sm bg-white/80 border-slate-200/80 shadow-sm">
              <SelectValue placeholder="Select a team member..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => {
                const colors = getRiskColor(user.risk_level as RiskLevel);
                return (
                  <SelectItem key={user.user_hash} value={user.user_hash}>
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colors.hex }}
                      />
                      <span className="font-mono text-sm">{abbreviateHash(user.user_hash)}</span>
                      <Badge
                        variant="outline"
                        className={`${getRiskBadgeColor(user.risk_level)} text-[10px] px-1.5 py-0 border`}
                      >
                        {user.risk_level}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="shrink-0 border-slate-200/80 bg-white/80 hover:bg-slate-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${(riskLoading || usersLoading) ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </motion.div>

      {/* ========== Error State ========== */}
      <AnimatePresence>
        {(riskError || usersError) && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="rounded-2xl bg-red-50/80 backdrop-blur-sm border border-red-100 p-4 flex items-center gap-4 text-red-800"
          >
            <div className="bg-red-100 p-2.5 rounded-xl ring-4 ring-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Unable to load data</h4>
              <p className="text-sm text-red-600/90 mt-0.5">
                {riskError?.message || usersError}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="bg-white border-red-200 hover:bg-red-50 text-red-700"
            >
              Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Risk Loading State ========== */}
      {riskLoading && selectedHash && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Skeleton className="h-[380px] w-full rounded-2xl" />
            <Skeleton className="h-[120px] rounded-2xl" />
            <Skeleton className="h-[120px] rounded-2xl" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[340px] rounded-2xl" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Skeleton className="h-[320px] rounded-2xl" />
              <Skeleton className="h-[320px] rounded-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* ========== Main Dashboard Content ========== */}
      <AnimatePresence mode="wait">
        {riskData && !riskLoading && selectedHash && (
          <motion.div
            key={selectedHash}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* ===== Left Column - Risk Meter & Key Metrics ===== */}
            <div className="space-y-6">
              {/* Risk Meter Card */}
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <Card className="overflow-hidden border border-white/30 shadow-sm ring-1 ring-slate-900/[0.04] bg-white/70 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-slate-50/80 to-white pb-4 border-b border-slate-100/60">
                    <CardTitle className="text-base font-semibold text-slate-800">Risk Assessment</CardTitle>
                    <CardDescription>Real-time burnout probability model</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8 pb-8 flex justify-center bg-white/50">
                    <RiskMeter
                      riskLevel={riskData.risk_level}
                      velocity={riskData.velocity}
                      confidence={riskData.confidence}
                      size="lg"
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Metrics */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-4"
              >
                <motion.div variants={itemVariants}>
                  <MetricCard
                    title="Belongingness Score"
                    value={riskData.belongingness_score}
                    icon={<Heart className="h-4 w-4" />}
                    status={riskData.risk_level}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MetricCard
                    title="Circadian Entropy"
                    value={riskData.circadian_entropy}
                    icon={<Clock className="h-4 w-4" />}
                    status={riskData.risk_level}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <MetricCard
                    title="Active Indicators"
                    value={Object.values(riskData.indicators).filter(Boolean).length}
                    unit={`/ ${Object.keys(riskData.indicators).length}`}
                    icon={<AlertCircle className="h-4 w-4" />}
                    status={riskData.risk_level}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* ===== Right Column - Charts & Activity ===== */}
            <div className="lg:col-span-2 space-y-6">
              {/* Risk History Chart */}
              {historyLoading ? (
                <Skeleton className="h-[340px] rounded-2xl" />
              ) : timelineData.length > 0 ? (
                <TimelineChart data={timelineData} />
              ) : (
                <Card className="border border-white/30 shadow-sm ring-1 ring-slate-900/[0.04] bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-slate-800">Risk History</CardTitle>
                    <CardDescription>No historical data available yet</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-[240px]">
                    <div className="text-center">
                      <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">History will populate as risk assessments are recorded.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Team Members & Activity Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Team Members */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                  <Card className="border border-white/30 shadow-sm ring-1 ring-slate-900/[0.04] bg-white/70 backdrop-blur-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-800">Team Insights</CardTitle>
                        <CardDescription>
                          {users.length} member{users.length !== 1 ? 's' : ''} tracked
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-slate-500 hover:text-slate-900"
                        onClick={fetchUsers}
                      >
                        <RefreshCw className={`h-3 w-3 mr-1 ${usersLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-0.5 max-h-[320px] overflow-y-auto">
                      {users.slice(0, 8).map((user) => {
                        const isSelected = user.user_hash === selectedHash;
                        return (
                          <motion.div
                            key={user.user_hash}
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => handleUserSelect(user.user_hash)}
                            className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'bg-blue-50/80 ring-1 ring-blue-200/40'
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className={`h-9 w-9 ring-2 shadow-sm transition-all ${
                                isSelected ? 'ring-blue-200' : 'ring-white group-hover:ring-blue-50'
                              }`}>
                                <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-xs font-semibold">
                                  {getInitials(user.user_hash)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-mono font-medium text-sm text-slate-900">
                                  {abbreviateHash(user.user_hash)}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {timeAgo(user.updated_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                {getTrendIcon(user.velocity)}
                              </div>
                              <Badge
                                variant="outline"
                                className={`${getRiskBadgeColor(user.risk_level)} border font-medium text-[11px]`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getRiskDotColor(user.risk_level)}`} />
                                {user.risk_level}
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}

                      {users.length === 0 && !usersLoading && (
                        <div className="text-center py-8 text-sm text-slate-400">
                          No team members found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Activity Feed */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                  <Card className="border border-white/30 shadow-sm ring-1 ring-slate-900/[0.04] bg-white/70 backdrop-blur-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-800">Live Activity</CardTitle>
                        <CardDescription>Recent risk changes and events</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[320px] overflow-y-auto">
                      {activityFeed.length > 0 ? (
                        activityFeed.map((activity, i) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.3 }}
                            className="relative flex gap-4"
                          >
                            {i !== activityFeed.length - 1 && (
                              <div className="absolute top-3 left-[5px] w-px h-[calc(100%+8px)] bg-gradient-to-b from-slate-200 to-transparent" />
                            )}
                            <div
                              className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ring-4 ring-white/80 ${
                                activity.severity === 'high'
                                  ? 'bg-red-500 shadow-sm shadow-red-200'
                                  : activity.severity === 'medium'
                                  ? 'bg-amber-500 shadow-sm shadow-amber-200'
                                  : activity.severity === 'low'
                                  ? 'bg-emerald-500 shadow-sm shadow-emerald-200'
                                  : 'bg-slate-300'
                              }`}
                            />
                            <div className="flex-1 min-w-0 pb-1">
                              <p className="text-sm text-slate-700 leading-snug">{activity.message}</p>
                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.time}
                              </p>
                            </div>
                            {activity.type === 'nudge' && (
                              <MessageSquare className="h-4 w-4 text-amber-400 mt-1 flex-shrink-0" />
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-10">
                          <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">No recent activity</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Nudge Card (when available) */}
              <AnimatePresence>
                {nudgeMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-blue-100/60 shadow-sm bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40 backdrop-blur-sm ring-1 ring-blue-200/20">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800 mb-1">Active Nudge</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{nudgeMessage}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== No User Selected State ========== */}
      {!riskData && !riskLoading && !riskError && selectedHash === null && users.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="text-center py-16 border-dashed border-2 border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-white">
            <CardContent>
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-sm ring-1 ring-slate-200/50 flex items-center justify-center mb-5">
                <ArrowUpRight className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Select a Team Member</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm leading-relaxed">
                Choose a team member from the dropdown above to view their risk analysis, timeline, and safety metrics.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
