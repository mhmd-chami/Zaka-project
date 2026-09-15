/** Light palette — mirrors dark theme structure for SettingsContext. */
export const lightColors = {
  background: '#F4F7FA',
  backgroundAlt: '#EAF0F5',
  surface: '#FFFFFF',
  surfaceLight: '#F0F4F8',
  surfaceElevated: '#FFFFFF',
  surfaceSoft: '#F7FAFC',

  primary: '#2C6B5E',
  primaryLight: '#2E7A6B',
  primaryDark: '#1E4F45',
  primaryMuted: '#DCEDE9',
  primarySoft: 'rgba(62, 142, 126, 0.10)',

  gold: '#A98A44',
  goldLight: '#8A7538',
  goldMuted: '#6E5C2C',
  goldSoft: 'rgba(169, 138, 68, 0.10)',

  accent: '#2E7A6B',
  accentSoft: '#DCEDE9',

  warning: '#A9802F',
  danger: '#C74855',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  border: 'rgba(15, 23, 42, 0.08)',
  borderStrong: 'rgba(15, 23, 42, 0.14)',
  borderGold: 'rgba(184, 148, 46, 0.35)',

  income: '#059669',
  expense: '#E11D48',
  pending: '#A9802F',

  admin: '#A9802F',
  adminDark: '#8A6420',
  owner: '#6B5AA0',
  ownerDark: '#4E4180',
};

export type ThemeColors = typeof lightColors;
