import { AppIcon } from '@/components/AppIcon';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationBellButton } from '@/components/NotificationBellButton';
import { colors, tabScreenOptions } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        ...tabScreenOptions(colors.primaryLight, insets.bottom),
        headerRight: () => <NotificationBellButton />,
        sceneStyle: { flex: 1, backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ZakaPay',
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => <AppIcon name="wallet" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => <AppIcon name="shop" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cash-out"
        options={{
          title: 'Cash Out',
          tabBarLabel: 'Cash Out',
          tabBarIcon: ({ color, size }) => <AppIcon name="banknote" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <AppIcon name="history" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <AppIcon name="user" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
