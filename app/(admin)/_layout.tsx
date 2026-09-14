import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, tabScreenOptions } from '@/constants/theme';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function AdminLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={tabScreenOptions(colors.warning, insets.bottom)}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Location Wallet',
          tabBarLabel: 'Wallet',
          tabBarIcon: () => <TabIcon emoji="💳" />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Branch Requests',
          tabBarLabel: 'Requests',
          tabBarIcon: () => <TabIcon emoji="📥" />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Admin Panel',
          tabBarLabel: 'Dashboard',
          tabBarIcon: () => <TabIcon emoji="🛡️" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Transactions',
          tabBarIcon: () => <TabIcon emoji="📋" />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Send Alert',
          tabBarIcon: () => <TabIcon emoji="📢" />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Users',
          tabBarIcon: () => <TabIcon emoji="👥" />,
        }}
      />
    </Tabs>
  );
}
