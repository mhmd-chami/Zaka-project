import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUsers } from '@/services/authStorage';
import { AppNotification, UserRole } from '@/types';

const NOTIF_KEY = '@zaka_notifications';

async function getAll(): Promise<AppNotification[]> {
  const raw = await AsyncStorage.getItem(NOTIF_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAll(notifications: AppNotification[]): Promise<void> {
  await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
}

export async function getNotifications(
  userId: string
): Promise<AppNotification[]> {
  const all = await getAll();
  return all
    .filter((n) => n.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getUnreadCount(userId: string): Promise<number> {
  const list = await getNotifications(userId);
  return list.filter((n) => !n.read).length;
}

export async function markAsRead(notificationId: string): Promise<void> {
  const all = await getAll();
  const idx = all.findIndex((n) => n.id === notificationId);
  if (idx >= 0) {
    all[idx].read = true;
    await saveAll(all);
  }
}

export async function markAllRead(userId: string): Promise<void> {
  const all = await getAll();
  const updated = all.map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  await saveAll(updated);
}

export async function sendNotificationToUser(
  userId: string,
  title: string,
  message: string,
  fromRole: UserRole
): Promise<void> {
  const all = await getAll();
  all.unshift({
    id: `notif-${Date.now()}-${userId}`,
    userId,
    title,
    message,
    read: false,
    fromRole,
    createdAt: new Date().toISOString(),
  });
  await saveAll(all);
}

export async function broadcastNotification(
  title: string,
  message: string,
  fromRole: UserRole,
  targetRole?: UserRole
): Promise<number> {
  const users = await getAllUsers();
  const targets = users.filter((u) => {
    const role = u.role ?? 'user';
    if (targetRole) return role === targetRole;
    return role === 'user';
  });

  const all = await getAll();
  const now = Date.now();

  targets.forEach((user, i) => {
    all.unshift({
      id: `notif-${now}-${i}-${user.id}`,
      userId: user.id,
      title,
      message,
      read: false,
      fromRole,
      createdAt: new Date().toISOString(),
    });
  });

  await saveAll(all);
  return targets.length;
}

export async function sendWelcomeNotification(userId: string): Promise<void> {
  await sendNotificationToUser(
    userId,
    'Welcome to ZakaPay! 🎉',
    'Your wallet is ready. You start with $150 balance.',
    'admin'
  );
}
