import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
}

export function ScreenBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <View pointerEvents="none" style={styles.accentLine} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glowTop: {
    position: 'absolute',
    top: -130,
    right: -90,
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    left: -130,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: colors.gold,
    opacity: 0.055,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: '28%',
    width: '44%',
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.gold,
    opacity: 0.45,
  },
});
