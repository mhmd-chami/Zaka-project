import { AppIcon } from '@/components/AppIcon';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabScreenOptions } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useSettings();

  return (
    <Tabs
      screenOptions={{
        ...tabScreenOptions(colors, colors.warning, insets.bottom),
        sceneStyle: { flex: 1, backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Admin Panel',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <AppIcon name="shield" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Location Wallet',
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => <AppIcon name="wallet" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Transactions',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => <AppIcon name="history" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="requests" options={{ href: null }} />
      <Tabs.Screen name="members" options={{ href: null }} />
      <Tabs.Screen name="alerts" options={{ href: null }} />
    </Tabs>
  );
}
