import { AppIcon } from '@/components/AppIcon';
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
import { useSettings } from '@/contexts/SettingsContext';
import { getSession } from '@/services/authStorage';
import {
  getNotifications,
  markAllRead,
  markAsRead,
} from '@/services/notificationStorage';
import { AppNotification } from '@/types';

export default function NotificationsScreen() {
  const { colors } = useSettings();
  const styles = makeStyles(colors);
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
      {unread > 0 ? (
        <Pressable style={styles.markAll} onPress={handleMarkAll}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </Pressable>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <AppIcon name="bell" size={48} color={colors.textMuted} />
            </View>
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

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
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
    emptyIcon: {
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
}
