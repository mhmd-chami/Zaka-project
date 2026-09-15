import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationBellButton } from '@/components/NotificationBellButton';
import { colors, tabScreenOptions } from '@/constants/theme';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        ...tabScreenOptions(colors.goldLight, insets.bottom),
        headerRight: () => <NotificationBellButton />,
        sceneStyle: { flex: 1, backgroundColor: colors.background },
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
        name="cash-out"
        options={{
          title: 'Cash Out',
          tabBarLabel: 'Cash Out',
          tabBarIcon: () => <TabIcon emoji="💵" />,
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
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <TabIcon emoji="👤" />,
        }}
      />
    </Tabs>
  );
}
