import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryDark,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'MedPack' }} />
        <Stack.Screen name="checklist/[id]" options={{ title: 'Packing List' }} />
        <Stack.Screen name="history" options={{ title: 'My Packs' }} />
      </Stack>
    </>
  );
}
