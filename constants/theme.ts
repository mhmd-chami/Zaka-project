import { TextStyle, ViewStyle } from 'react-native';

/** ZakaPay - a refined dark fintech palette built for trust and clarity. */

export const colors = {
  background: '#05080D',
  backgroundAlt: '#080D16',
  surface: '#0C1420',
  surfaceLight: '#111B28',
  surfaceElevated: '#162231',
  surfaceSoft: '#0F1926',

  primary: '#3E8E7E',
  primaryLight: '#5FB8A6',
  primaryDark: '#2C6B5E',
  primaryMuted: '#13302B',
  primarySoft: 'rgba(62, 142, 126, 0.12)',

  gold: '#C9A961',
  goldLight: '#E0CE8A',
  goldMuted: '#8A7538',
  goldSoft: 'rgba(201, 169, 97, 0.10)',

  accent: '#5FB8A6',
  accentSoft: '#CBEBE1',

  warning: '#C9A961',
  danger: '#E05A6A',

  text: '#F0F4F8',
  textSecondary: '#9AA9B9',
  textMuted: '#5E6D7E',

  border: 'rgba(154, 169, 185, 0.12)',
  borderStrong: 'rgba(154, 169, 185, 0.20)',
  borderGold: 'rgba(201, 169, 97, 0.28)',

  income: '#5FB8A6',
  expense: '#E05A6A',
  pending: '#C9A961',

  admin: '#C9A961',
  adminDark: '#4A3A18',
  owner: '#7E6BB8',
  ownerDark: '#2E2450',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const typography = {
  hero: {
    fontSize: 36,
    fontWeight: '800' as const,
    letterSpacing: -1.0,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.6,
  },
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 18,
    elevation: 5,
  },
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 2,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
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
  borderTopWidth: 2,
  borderTopColor: colors.gold,
};

export function tabScreenOptions(
  palette: typeof colors = colors,
  accent = palette.primary,
  bottomInset = 0
) {
  const tabPaddingBottom = Math.max(bottomInset, 8);

  return {
    headerStyle: {
      backgroundColor: palette.background,
    },
    headerTintColor: palette.text,
    headerTitleStyle: {
      fontSize: 17,
      fontWeight: '700' as const,
      color: palette.text,
      letterSpacing: -0.2,
    },
    headerShadowVisible: false,
    tabBarStyle: {
      height: 56 + tabPaddingBottom,
      backgroundColor: palette.surface,
      borderTopColor: palette.border,
      borderTopWidth: 1,
      paddingTop: 6,
      paddingBottom: tabPaddingBottom,
      elevation: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
    },
    tabBarItemStyle: {
      borderRadius: radius.md,
      minWidth: 0,
    },
    tabBarActiveBackgroundColor: `${accent}15`,
    tabBarActiveTintColor: accent,
    tabBarInactiveTintColor: palette.textMuted,
    tabBarLabelStyle: {
      fontSize: 9,
      fontWeight: '700' as const,
      letterSpacing: 0.5,
      marginTop: 1,
    },
  };
}

export function contentBottomPadding(
  bottomInset = 0,
  extra = 12
): number {
  return Math.max(bottomInset, 8) + extra;
}

export const logoText: TextStyle = {
  fontSize: 32,
  fontWeight: '800',
  letterSpacing: -1.0,
};