import { Tabs, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, tabScreenOptions } from '@/constants/theme';
import { getSession } from '@/services/authStorage';
import { getUnreadCount } from '@/services/notificationStorage';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [badge, setBadge] = useState<number | undefined>();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const session = await getSession();
        if (!session || !active) return;
        const count = await getUnreadCount(session.userId);
        if (active) {
          setBadge(count > 0 ? count : undefined);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <Tabs
      screenOptions={tabScreenOptions(colors.goldLight, insets.bottom)}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ZakaPay',
          tabBarLabel: 'Wallet',
          tabBarIcon: () => <TabIcon emoji="💳" />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: () => <TabIcon emoji="🛍️" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: () => <TabIcon emoji="📋" />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: () => <TabIcon emoji="🔔" />,
          ...(badge ? { tabBarBadge: badge } : {}),
        }}
      />
    </Tabs>
  );
}
