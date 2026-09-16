import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
}

export function ScreenBackground({ children, style }: Props) {
  const { colors } = useSettings();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.root, style]}>
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <View pointerEvents="none" style={styles.accentLine} />
      {children}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    glowTop: {
      position: 'absolute',
      top: -100,
      right: -70,
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: colors.primary,
      opacity: 0.07,
    },
    glowBottom: {
      position: 'absolute',
      bottom: -90,
      left: -100,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: colors.gold,
      opacity: 0.04,
    },
    accentLine: {
      position: 'absolute',
      top: 0,
      left: '30%',
      width: '40%',
      height: 2,
      borderRadius: 2,
      backgroundColor: colors.goldLight,
      opacity: 0.30,
    },
  });
}
