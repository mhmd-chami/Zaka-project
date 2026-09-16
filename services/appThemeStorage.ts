import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme } from '@/types';

const GLOBAL_THEME_KEY = '@zaka_app_theme';

export async function getGlobalTheme(): Promise<AppTheme | null> {
  const raw = await AsyncStorage.getItem(GLOBAL_THEME_KEY);
  return raw === 'light' || raw === 'dark' ? raw : null;
}

export async function saveGlobalTheme(theme: AppTheme): Promise<void> {
  await AsyncStorage.setItem(GLOBAL_THEME_KEY, theme);
}
