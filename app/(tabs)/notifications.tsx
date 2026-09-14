import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NotificationRow } from '@/components/NotificationRow';
import { colors } from '@/constants/theme';
import { getSession } from '@/services/authStorage';
import {
  getNotifications,
  markAllRead,
  markAsRead,
} from '@/services/notificationStorage';
import { AppNotification } from '@/types';

export default function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>([]);

  const load = useCallback(async () => {
    const session = await getSession();
    if (!session) return;
    setItems(await getNotifications(session.userId));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handlePress(notif: AppNotification) {
    if (!notif.read) {
      await markAsRead(notif.id);
      load();
    }
  }

  async function handleMarkAll() {
    const session = await getSession();
    if (!session) return;
    await markAllRead(session.userId);
    load();
  }

  const unread = items.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      {unread > 0 && (
        <Pressable style={styles.markAll} onPress={handleMarkAll}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </Pressable>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>
              You'll see alerts from ZakaPay here
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <NotificationRow
            notification={item}
            onPress={() => handlePress(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  markAll: {
    alignSelf: 'flex-end',
    padding: 16,
    paddingBottom: 0,
  },
  markAllText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
});
