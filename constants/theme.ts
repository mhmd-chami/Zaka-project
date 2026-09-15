import { TextStyle, ViewStyle } from 'react-native';

/** ZakaPay — a modern dark fintech palette with emerald actions and warm brand accents. */
export const colors = {
  background: '#070B11',
  backgroundAlt: '#0B111A',
  surface: '#101923',
  surfaceLight: '#16212D',
  surfaceElevated: '#1C2A37',
  surfaceSoft: '#121D28',

  primary: '#28C780',
  primaryLight: '#65E3A7',
  primaryDark: '#15915B',
  primaryMuted: '#103B2A',
  primarySoft: 'rgba(40, 199, 128, 0.13)',

  gold: '#EBCB68',
  goldLight: '#F5DD91',
  goldMuted: '#8F7939',
  goldSoft: 'rgba(235, 203, 104, 0.12)',

  accent: '#65E3A7',
  accentSoft: '#C8F7DC',

  warning: '#F5B942',
  danger: '#FF6376',

  text: '#F5F8FB',
  textSecondary: '#A0ADBC',
  textMuted: '#667587',

  border: 'rgba(160, 173, 188, 0.14)',
  borderStrong: 'rgba(160, 173, 188, 0.24)',
  borderGold: 'rgba(235, 203, 104, 0.3)',

  income: '#42D991',
  expense: '#FF7182',
  pending: '#F5B942',

  admin: '#F5B942',
  adminDark: '#513510',
  owner: '#9B87F5',
  ownerDark: '#352764',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  full: 999,
};

export const typography = {
  hero: { fontSize: 38, fontWeight: '800' as const, letterSpacing: -1.2 },
  title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.7 },
  heading: { fontSize: 19, fontWeight: '700' as const, letterSpacing: -0.25 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 17 },
  label: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 0.1 },
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
  },
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
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
  borderTopWidth: 2,
  borderTopColor: colors.gold,
};

export function tabScreenOptions(accent = colors.primary, bottomInset = 0) {
  const tabPaddingBottom = Math.max(bottomInset, 8);

  return {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text,
      letterSpacing: -0.2,
    },
    headerShadowVisible: false,
    tabBarStyle: {
      height: 60 + tabPaddingBottom,
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      paddingTop: 7,
      paddingBottom: tabPaddingBottom,
      elevation: 14,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.2,
      shadowRadius: 18,
    },
    tabBarItemStyle: {
      borderRadius: radius.md,
      minWidth: 0,
    },
    tabBarActiveBackgroundColor: `${accent}12`,
    tabBarActiveTintColor: accent,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '700' as const,
      letterSpacing: 0.1,
      marginTop: 1,
    },
  };
}

export function contentBottomPadding(bottomInset = 0, extra = 16): number {
  return Math.max(bottomInset, 8) + extra;
}

export const logoText: TextStyle = {
  fontSize: 34,
  fontWeight: '800',
  letterSpacing: -1.2,
};
