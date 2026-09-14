import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/constants/theme';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function OwnerLayout() {
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
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Owner Wallet',
          tabBarLabel: 'Wallet',
          tabBarIcon: () => <TabIcon emoji="💳" />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Owner Control',
          tabBarLabel: 'Overview',
          tabBarIcon: () => <TabIcon emoji="👑" />,
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
        name="admins"
        options={{
          title: 'Manage Roles',
          tabBarIcon: () => <TabIcon emoji="🛡️" />,
        }}
      />
      <Tabs.Screen
        name="broadcast"
        options={{
          title: 'Broadcast',
          tabBarIcon: () => <TabIcon emoji="📢" />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'All Accounts',
          tabBarIcon: () => <TabIcon emoji="👥" />,
        }}
      />
    </Tabs>
  );
}
