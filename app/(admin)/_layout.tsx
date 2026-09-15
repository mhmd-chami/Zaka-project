import { AppIcon } from '@/components/AppIcon';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, tabScreenOptions } from '@/constants/theme';

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
          tabBarIcon: ({ color, size }) => <AppIcon name="wallet" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Branch Requests',
          tabBarLabel: 'Requests',
          tabBarIcon: ({ color, size }) => <AppIcon name="receive" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Admin Panel',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <AppIcon name="shield" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => <AppIcon name="history" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Send Alert',
          tabBarIcon: ({ color, size }) => <AppIcon name="megaphone" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => <AppIcon name="users" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
