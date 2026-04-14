import { api } from './api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  action_url: string | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export async function getNotifications(unreadOnly: boolean = false, limit: number = 50): Promise<NotificationsResponse> {
  const params = new URLSearchParams();
  if (unreadOnly) params.set('unread_only', 'true');
  params.set('limit', String(limit));
  return api.get<NotificationsResponse>(`/notifications/?${params.toString()}`);
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
  return response.unread_count || 0;
}

export async function markAsRead(notificationId: string): Promise<void> {
  return api.put(`/notifications/${notificationId}/read`);
}

export async function markAllRead(): Promise<void> {
  return api.put('/notifications/mark-all-read');
}

export async function deleteNotification(notificationId: string): Promise<void> {
  return api.delete(`/notifications/${notificationId}`);
}

export async function getNotificationPreferences(): Promise<any[]> {
  return api.get('/notifications/preferences');
}

export async function updateNotificationPreferences(preferences: any[]): Promise<void> {
  return api.put('/notifications/preferences', preferences);
}
