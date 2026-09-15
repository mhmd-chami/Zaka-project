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
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ProfileSettings | null>(null);

  const refreshSettings = useCallback(async () => {
    setSettings(await getProfileSettings());
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const patchSettings = useCallback(
    async (patch: Partial<ProfileSettings>) => {
      const next = await updateProfileSettings(patch);
      if (next) setSettings(next);
    },
    []
  );

  const language = settings?.language ?? 'en';
  const theme = settings?.theme ?? 'dark';
  const palette = theme === 'light' ? lightColors : darkColors;

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      colors: palette,
      language,
      theme,
      refreshSettings,
      patchSettings,
      t: (key: string) => translate(key, language),
    }),
    [settings, palette, language, theme, refreshSettings, patchSettings]
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
      t: (key: string) => translate(key, 'en'),
    };
  }
  return ctx;
}
