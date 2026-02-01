'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Network,
  Play,
  Users,
  Menu,
  X,
  Shield,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    badge: null,
  },
  { 
    href: '/network', 
    label: 'Network', 
    icon: Network,
    badge: null,
  },
  { 
    href: '/team', 
    label: 'Team', 
    icon: Users,
    badge: { text: '3', variant: 'destructive' as const },
  },
  { 
    href: '/simulation', 
    label: 'Simulation', 
    icon: Play,
    badge: null,
  },
];

const secondaryNavItems = [
  { href: '#', label: 'Notifications', icon: Bell, badge: { text: '2', variant: 'default' as const } },
  { href: '#', label: 'Settings', icon: Settings, badge: null },
  { href: '#', label: 'Help', icon: HelpCircle, badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-sm border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 bg-white border-r shadow-lg lg:shadow-none',
          'lg:translate-x-0 lg:static lg:h-screen flex flex-col'
        )}
      >
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">Sentinel</span>
              <p className="text-xs text-slate-500">AI Employee Insights</p>
            </div>
          </Link>
        </div>

        <Separator />

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Main
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  'hover:bg-slate-100 group',
                  isActive && 'bg-blue-50 text-blue-600 font-medium'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                )} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badge.variant} 
                    className="h-5 min-w-5 flex items-center justify-center text-xs"
                  >
                    {item.badge.text}
                  </Badge>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="w-1.5 h-1.5 rounded-full bg-blue-600"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          <p className="px-4 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            System
          </p>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-slate-100 group"
              >
                <Icon className="h-5 w-5 text-slate-500 group-hover:text-slate-700" />
                <span className="flex-1 text-slate-600 group-hover:text-slate-900">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badge.variant} 
                    className="h-5 min-w-5 flex items-center justify-center text-xs"
                  >
                    {item.badge.text}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* User Section */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">John Doe</p>
              <p className="text-xs text-slate-500 truncate">Engineering Manager</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="px-4 text-xs text-slate-400">
            <p>Sentinel AI Engine v1.0</p>
            <p className="mt-1">Privacy-first insights</p>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
