'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { RiskMeter } from '@/components/dashboard/RiskMeter';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TimelineChart } from '@/components/dashboard/TimelineChart';
import { useRiskData } from '@/hooks/useRiskData';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  MoreHorizontal
} from 'lucide-react';

// Sample timeline data for demo
const sampleTimelineData = [
  { timestamp: '2026-01-29T10:00:00Z', risk_level: 'LOW' as const, velocity: 1.2 },
  { timestamp: '2026-01-29T11:00:00Z', risk_level: 'LOW' as const, velocity: 1.5 },
  { timestamp: '2026-01-29T12:00:00Z', risk_level: 'ELEVATED' as const, velocity: 2.1 },
  { timestamp: '2026-01-29T13:00:00Z', risk_level: 'ELEVATED' as const, velocity: 2.8 },
  { timestamp: '2026-01-29T14:00:00Z', risk_level: 'CRITICAL' as const, velocity: 3.5 },
];

// Sample team members data
const sampleTeamMembers = [
  { id: '1', name: 'Alex Chen', role: 'Senior Engineer', riskLevel: 'LOW' as const, trend: 'stable', avatar: 'AC' },
  { id: '2', name: 'Sarah Miller', role: 'Product Manager', riskLevel: 'ELEVATED' as const, trend: 'up', avatar: 'SM' },
  { id: '3', name: 'Jordan Lee', role: 'Frontend Dev', riskLevel: 'LOW' as const, trend: 'down', avatar: 'JL' },
  { id: '4', name: 'Morgan Taylor', role: 'Backend Dev', riskLevel: 'CRITICAL' as const, trend: 'up', avatar: 'MT' },
  { id: '5', name: 'Casey Wilson', role: 'DevOps Engineer', riskLevel: 'LOW' as const, trend: 'stable', avatar: 'CW' },
];

// Sample activity feed
const sampleActivity = [
  { id: '1', type: 'risk_change', message: 'Morgan Taylor risk level increased to Critical', time: '5 min ago', severity: 'high' },
  { id: '2', type: 'nudge', message: 'Wellness nudge sent to Sarah Miller', time: '15 min ago', severity: 'medium' },
  { id: '3', type: 'team', message: 'Team velocity improved by 12%', time: '1 hour ago', severity: 'low' },
  { id: '4', type: 'system', message: 'Weekly culture report generated', time: '2 hours ago', severity: 'info' },
];

// Sample stats
const statsData = {
  totalMembers: 28,
  atRisk: 3,
  critical: 1,
  avgVelocity: 2.4,
  trend: 'down',
  trendValue: '12%',
};

function getRiskBadgeColor(riskLevel: string) {
  switch (riskLevel) {
    case 'LOW':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'ELEVATED':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'CRITICAL':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    default:
      return <Activity className="h-4 w-4 text-slate-400" />;
  }
}

export default function DashboardPage() {
  const [userHash, setUserHash] = useState('demo_user_hash');
  const [inputHash, setInputHash] = useState('demo_user_hash');
  
  const { data, isLoading, error, refetch } = useRiskData(userHash);
  const { connectionStatus, lastPing, requestUpdate } = useWebSocket(userHash);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserHash(inputHash);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Header
        title="Dashboard Overview"
        description="Monitor team health, risks, and key metrics"
        connectionStatus={connectionStatus}
        lastPing={lastPing || undefined}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none shadow-sm ring-1 ring-slate-900/5 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 opacity-75" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Total Members</p>
                <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{statsData.totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500">
              <span className="text-green-600 font-medium flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> +2
              </span>
              <span className="ml-1">new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none shadow-sm ring-1 ring-slate-900/5 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600 opacity-75" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 group-hover:text-amber-600 transition-colors">At Risk</p>
                <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{statsData.atRisk}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500">
              <span className="text-amber-600 font-medium">+1</span>
              <span className="ml-1">since yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none shadow-sm ring-1 ring-slate-900/5 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 opacity-75" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 group-hover:text-red-600 transition-colors">Critical</p>
                <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{statsData.critical}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Requires immediate attention
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-none shadow-sm ring-1 ring-slate-900/5 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 opacity-75" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 group-hover:text-green-600 transition-colors">Avg Velocity</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">{statsData.avgVelocity}</p>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500">
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <TrendingDown className="h-3 w-3" /> {statsData.trendValue}
              </span>
              <span className="ml-1">optimization</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Selection & Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="flex-1 flex gap-3 w-full md:w-auto">
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              id="userHash"
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              placeholder="Search user hash..."
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
          <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white">
            Load Data
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={requestUpdate} disabled={connectionStatus !== 'connected'} className="shrink-0">
            <RefreshCw className={`h-4 w-4 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-4 flex items-center gap-4 text-red-800 animate-in slide-in-from-top-2">
          <div className="bg-red-100 p-2 rounded-full ring-4 ring-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Unable to load dashboard data</h4>
            <p className="text-sm text-red-600/90 mt-0.5">{error.message}</p>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} className="bg-white border-red-200 hover:bg-red-50 text-red-700">
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-[350px] w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <Skeleton className="h-[140px] rounded-xl" />
              <Skeleton className="h-[140px] rounded-xl" />
              <Skeleton className="h-[140px] rounded-xl" />
            </div>
            <Skeleton className="h-[250px] rounded-xl" />
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      {data && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
          {/* Left Column - Risk Meter & Key Metrics */}
          <div className="space-y-6">
            {/* Risk Meter Card */}
            <Card className="overflow-hidden border-none shadow-sm ring-1 ring-slate-900/5">
              <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800">Risk Assessment</CardTitle>
                <CardDescription>Real-time burnout probability model</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 pb-8 flex justify-center bg-white">
                <RiskMeter
                  riskLevel={data.risk_level}
                  velocity={data.velocity}
                  confidence={data.confidence}
                  size="lg"
                />
              </CardContent>
            </Card>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 gap-4">
              <MetricCard
                title="Belongingness Score"
                value={data.belongingness_score}
                icon={<Heart className="h-4 w-4" />}
                status={data.risk_level}
              />
              <MetricCard
                title="Circadian Entropy"
                value={data.circadian_entropy}
                icon={<Clock className="h-4 w-4" />}
                status={data.risk_level}
              />
              <MetricCard
                title="Active Indicators"
                value={Object.values(data.indicators).filter(Boolean).length}
                unit={`/ ${Object.keys(data.indicators).length}`}
                icon={<AlertCircle className="h-4 w-4" />}
                status={data.risk_level}
              />
            </div>
          </div>

          {/* Right Column - Charts & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Risk History Chart */}
            <TimelineChart data={sampleTimelineData} />

            {/* Team Members & Activity Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Team Members */}
              <Card className="border-none shadow-sm ring-1 ring-slate-900/5 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-800">Team Insights</CardTitle>
                    <CardDescription>Member risk status</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-slate-900">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-1">
                  {sampleTeamMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50/80 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm group-hover:ring-blue-50 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-xs font-semibold">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {getTrendIcon(member.trend)}
                        </div>
                        <Badge variant="outline" className={`${getRiskBadgeColor(member.riskLevel)} border-0 ring-1 ring-inset ring-current/20 font-medium`}>
                          {member.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card className="border-none shadow-sm ring-1 ring-slate-900/5 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-800">Live Activity</CardTitle>
                    <CardDescription>Recent system events</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sampleActivity.map((activity, i) => (
                    <div key={activity.id} className="relative flex gap-4">
                      {i !== sampleActivity.length - 1 && (
                        <div className="absolute top-2 left-1.5 w-px h-full bg-slate-100" />
                      )}
                      <div className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ring-4 ring-white ${
                        activity.severity === 'high' ? 'bg-red-500 shadow-red-200 shadow-sm' :
                        activity.severity === 'medium' ? 'bg-amber-500 shadow-amber-200 shadow-sm' :
                        activity.severity === 'low' ? 'bg-green-500 shadow-green-200 shadow-sm' :
                        'bg-slate-300'
                      }`} />
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-sm text-slate-700 leading-snug">{activity.message}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !isLoading && !error && (
        <Card className="text-center py-16 border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent>
            <div className="mx-auto w-12 h-12 bg-white rounded-xl shadow-sm ring-1 ring-slate-900/5 flex items-center justify-center mb-4">
               <Users className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No Data Selected</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
              Please enter a valid user hash above to attempt a risk analysis and view live safety metrics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
