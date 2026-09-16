import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/lightTheme';
import { useSettings } from '@/contexts/SettingsContext';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ThemeColors) => T
): T {
  const { colors } = useSettings();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}
