import { AppIcon } from '@/components/AppIcon';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabScreenOptions } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';

export default function OwnerLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useSettings();

  return (
    <Tabs
      screenOptions={{
        ...tabScreenOptions(colors, colors.owner, insets.bottom),
        sceneStyle: { flex: 1, backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Owner Control',
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }) => <AppIcon name="crown" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Owner Wallet',
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
      <Tabs.Screen name="admins" options={{ href: null }} />
      <Tabs.Screen name="accounts" options={{ href: null }} />
      <Tabs.Screen name="broadcast" options={{ href: null }} />
    </Tabs>
  );
}
