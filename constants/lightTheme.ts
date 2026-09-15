/** Light palette — mirrors dark theme structure for SettingsContext. */
export const lightColors = {
  background: '#F4F7FA',
  backgroundAlt: '#EAF0F5',
  surface: '#FFFFFF',
  surfaceLight: '#F0F4F8',
  surfaceElevated: '#FFFFFF',
  surfaceSoft: '#F7FAFC',

  primary: '#15915B',
  primaryLight: '#28C780',
  primaryDark: '#0F6B44',
  primaryMuted: '#D8F5E8',
  primarySoft: 'rgba(21, 145, 91, 0.12)',

  gold: '#B8942E',
  goldLight: '#D4AF37',
  goldMuted: '#8F7939',
  goldSoft: 'rgba(184, 148, 46, 0.12)',

  accent: '#28C780',
  accentSoft: '#D8F5E8',

  warning: '#D97706',
  danger: '#DC2626',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  border: 'rgba(15, 23, 42, 0.08)',
  borderStrong: 'rgba(15, 23, 42, 0.14)',
  borderGold: 'rgba(184, 148, 46, 0.35)',

  income: '#059669',
  expense: '#E11D48',
  pending: '#D97706',

  admin: '#D97706',
  adminDark: '#92400E',
  owner: '#7C3AED',
  ownerDark: '#5B21B6',
};

export type ThemeColors = typeof lightColors;
