'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, Info, Shield, Users, Activity } from 'lucide-react'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
  Notification
} from '@/lib/notifications'
import { timeAgo } from '@/lib/utils'

const typeIcons: Record<string, any> = {
  auth: Shield,
  security: AlertTriangle,
  team: Users,
  system: Info,
  activity: Activity,
}

const typeColors: Record<string, string> = {
  critical: 'text-[hsl(var(--sentinel-critical))]',
  high: 'text-[hsl(var(--sentinel-elevated))]',
  normal: 'text-[hsl(var(--sentinel-info))]',
  low: 'text-muted-foreground',
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getNotifications(false, 20)
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
    } catch (err) {
      // Silently fail - notifications are non-critical
      console.debug('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch {
      // Silent fail
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications, fetchUnreadCount])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })))
      setUnreadCount(0)
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      const deleted = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch { /* silent */ }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-auto p-1" onClick={handleMarkAllRead}>
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Info
              const colorClass = typeColors[notification.priority] || 'text-muted-foreground'
              const handleClick = () => {
                if (!notification.read) handleMarkAsRead(notification.id)
                if (notification.action_url) window.location.href = notification.action_url
              }
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 px-3 py-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''} ${notification.action_url ? 'hover:bg-muted/70' : ''}`}
                  onClick={handleClick}
                >
                  <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${!notification.read ? 'font-medium' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0 ml-2"
                        aria-label="Delete notification"
                        onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(notification.created_at)}</p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </DropdownMenuItem>
              )
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
