import type { Notification } from '@/types/db/notifications';

const store = new Map<string, Notification>();

export function getByUser(userId: string): Notification[] {
  return Array.from(store.values()).filter(n => n.userId === userId);
}

export function getById(id: string): Notification | null {
  return store.get(id) ?? null;
}

export function create(data: Omit<Notification, 'sentAt' | 'readAt'>): Notification {
  console.log('[DB STUB] notifications.create', { id: data.id, userId: data.userId, type: data.type });
  const notification: Notification = { ...data, sentAt: new Date(), readAt: null };
  store.set(notification.id, notification);
  return notification;
}

export function markRead(id: string): Notification | null {
  const existing = store.get(id);
  if (!existing) return null;
  console.log('[DB STUB] notifications.markRead', { id });
  const updated: Notification = { ...existing, readAt: new Date() };
  store.set(id, updated);
  return updated;
}
