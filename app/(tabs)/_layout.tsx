import { Tabs, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { colors } from '@/constants/theme';
import { getSession } from '@/services/authStorage';
import { getUnreadCount } from '@/services/notificationStorage';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabLayout() {
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
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
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
