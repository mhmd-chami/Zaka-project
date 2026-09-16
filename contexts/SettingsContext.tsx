import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { colors as darkColors } from '@/constants/theme';
import { lightColors, type ThemeColors } from '@/constants/lightTheme';
import { t as translate } from '@/constants/i18n';
import { getGlobalTheme, saveGlobalTheme } from '@/services/appThemeStorage';
import {
  getProfileSettings,
  saveProfileSettings,
  updateProfileSettings,
} from '@/services/profileSettingsStorage';
import { AppLanguage, AppTheme, ProfileSettings } from '@/types';

interface SettingsContextValue {
  settings: ProfileSettings | null;
  colors: ThemeColors;
  language: AppLanguage;
  theme: AppTheme;
  refreshSettings: () => Promise<void>;
  patchSettings: (patch: Partial<ProfileSettings>) => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [globalTheme, setGlobalTheme] = useState<AppTheme>('dark');

  const refreshSettings = useCallback(async () => {
    const [storedTheme, profileSettings] = await Promise.all([
      getGlobalTheme(),
      getProfileSettings(),
    ]);
    if (storedTheme) setGlobalTheme(storedTheme);
    setSettings(profileSettings);
  }, []);

  useEffect(() => {
    void getGlobalTheme().then((stored) => {
      if (stored) setGlobalTheme(stored);
    });
    refreshSettings();
  }, [refreshSettings]);

  const setTheme = useCallback(async (nextTheme: AppTheme) => {
    await saveGlobalTheme(nextTheme);
    setGlobalTheme(nextTheme);
    const next = await updateProfileSettings({ theme: nextTheme });
    if (next) setSettings(next);
  }, []);

  const patchSettings = useCallback(
    async (patch: Partial<ProfileSettings>) => {
      if (patch.theme) {
        await saveGlobalTheme(patch.theme);
        setGlobalTheme(patch.theme);
      }
      const next = await updateProfileSettings(patch);
      if (next) setSettings(next);
    },
    []
  );

  const language = settings?.language ?? 'en';
  const theme = settings?.theme ?? globalTheme;
  const palette = theme === 'light' ? lightColors : darkColors;

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      colors: palette,
      language,
      theme,
      refreshSettings,
      patchSettings,
      setTheme,
      t: (key: string) => translate(key, language),
    }),
    [settings, palette, language, theme, refreshSettings, patchSettings, setTheme]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      settings: null,
      colors: darkColors,
      language: 'en',
      theme: 'dark',
      refreshSettings: async () => {},
      patchSettings: async () => {},
      setTheme: async () => {},
      t: (key: string) => translate(key, 'en'),
    };
  }
  return ctx;
}
