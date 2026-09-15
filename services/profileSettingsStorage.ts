import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSession } from '@/services/authStorage';
import { ProfileSettings, SendMode } from '@/types';

const KEY_PREFIX = '@zaka_profile_settings_';

const DEFAULTS: ProfileSettings = {
  avatarEmoji: '👤',
  verified: true,
  notificationSound: true,
  notificationVibration: true,
  requirePinForSend: false,
  pinCode: null,
  defaultSendMode: 'p2p',
  language: 'en',
  theme: 'dark',
  dailySendLimit: 500,
  dailyCashOutLimit: 300,
};

function settingsKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function getProfileSettings(): Promise<ProfileSettings | null> {
  const session = await getSession();
  if (!session) return null;

  const raw = await AsyncStorage.getItem(settingsKey(session.userId));
  if (!raw) {
    await AsyncStorage.setItem(settingsKey(session.userId), JSON.stringify(DEFAULTS));
    return DEFAULTS;
  }

  const parsed = JSON.parse(raw) as Partial<ProfileSettings>;
  return {
    ...DEFAULTS,
    ...parsed,
  };
}

export async function saveProfileSettings(
  settings: ProfileSettings
): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await AsyncStorage.setItem(settingsKey(session.userId), JSON.stringify(settings));
}

export async function updateProfileSettings(
  patch: Partial<ProfileSettings>
): Promise<ProfileSettings | null> {
  const current = await getProfileSettings();
  if (!current) return null;
  const next = { ...current, ...patch };
  await saveProfileSettings(next);
  return next;
}

export async function verifySendPin(pin: string): Promise<boolean> {
  const settings = await getProfileSettings();
  if (!settings?.requirePinForSend) return true;
  if (!settings.pinCode) return true;
  return settings.pinCode === pin.trim();
}

export async function getDefaultSendMode(): Promise<SendMode> {
  const settings = await getProfileSettings();
  return settings?.defaultSendMode ?? 'p2p';
}
