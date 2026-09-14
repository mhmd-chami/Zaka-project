import { TextStyle, ViewStyle } from 'react-native';

/** ZakaPay — cedar green & gold fintech identity */
export const colors = {
  background: '#060A12',
  backgroundAlt: '#0A101C',
  surface: '#111827',
  surfaceLight: '#1A2332',
  surfaceElevated: '#1E2A3D',

  primary: '#40916C',
  primaryLight: '#52B788',
  primaryDark: '#2D6A4F',
  primaryMuted: '#1B4332',

  gold: '#D4AF37',
  goldLight: '#F0D060',
  goldMuted: '#9A7B2F',

  accent: '#74C69D',
  accentSoft: '#B7E4C7',

  warning: '#F59E0B',
  danger: '#EF4444',

  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  border: '#243044',
  borderGold: 'rgba(212, 175, 55, 0.35)',

  income: '#34D399',
  expense: '#FB7185',
  pending: '#FBBF24',

  admin: '#D97706',
  adminDark: '#92400E',
  owner: '#7C3AED',
  ownerDark: '#5B21B6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const typography = {
  hero: { fontSize: 36, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
  heading: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  label: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 0.3 },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const cardStyle: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  overflow: 'hidden',
};

export const goldTopBorder: ViewStyle = {
  borderTopWidth: 3,
  borderTopColor: colors.gold,
};

export function tabScreenOptions(accent = colors.primary) {
  return {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' as const, color: colors.text },
    headerShadowVisible: false,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.borderGold,
      borderTopWidth: 1,
      height: 60,
      paddingBottom: 8,
      paddingTop: 6,
    },
    tabBarActiveTintColor: accent,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
  };
}

export const logoText: TextStyle = {
  fontSize: 34,
  fontWeight: '800',
  letterSpacing: -0.5,
};
