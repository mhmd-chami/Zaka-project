import { AppIcon } from '@/components/AppIcon';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { getSession } from '@/services/authStorage';
import { getUnreadCount } from '@/services/notificationStorage';

export function NotificationBellButton() {
  const router = useRouter();
  const { colors } = useSettings();
  const styles = makeStyles(colors);
  const [unread, setUnread] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const session = await getSession();
        if (!session || !active) return;
        setUnread(await getUnreadCount(session.userId));
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <Pressable
      style={styles.btn}
      onPress={() => router.push('/notifications')}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={unread ? `Notifications, ${unread} unread` : 'Notifications'}
    >
      <AppIcon name="bell" size={22} />
      {unread > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unread > 9 ? '9+' : unread}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    btn: {
      marginRight: 16,
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceLight,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -3,
      right: -3,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 1.5,
      borderColor: colors.surface,
    },
    badgeText: {
      color: colors.surface,
      fontSize: 10,
      fontWeight: '800',
    },
  });
}
