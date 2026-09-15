import { AppIcon } from '@/components/AppIcon';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, tabScreenOptions } from '@/constants/theme';

export default function OwnerLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={tabScreenOptions(colors.owner, insets.bottom)}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Owner Wallet',
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => <AppIcon name="wallet" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Owner Control',
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }) => <AppIcon name="crown" color={color} size={size} />,
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
        name="admins"
        options={{
          title: 'Manage Roles',
          tabBarIcon: ({ color, size }) => <AppIcon name="shield" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="broadcast"
        options={{
          title: 'Broadcast',
          tabBarIcon: ({ color, size }) => <AppIcon name="megaphone" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'All Accounts',
          tabBarIcon: ({ color, size }) => <AppIcon name="users" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
