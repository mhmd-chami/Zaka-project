import { StyleSheet, Text, View } from 'react-native';
import { colors, logoText } from '@/constants/theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function ZakaLogo({ size = 'md', showTagline = false }: Props) {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.2 : 1;

  return (
    <View style={styles.wrap}>
      <View style={[styles.badge, { transform: [{ scale }] }]}>
        <Text style={styles.cedar}>🌲</Text>
      </View>
      <View style={{ transform: [{ scale }] }}>
        <Text style={styles.brand}>
          <Text style={styles.zaka}>Zaka</Text>
          <Text style={styles.pay}>Pay</Text>
        </Text>
        {showTagline ? (
          <Text style={styles.tagline}>Lebanon's wallet · Send · Shop · Pay</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryMuted,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  cedar: {
    fontSize: 32,
  },
  brand: {
    ...logoText,
    textAlign: 'center',
  },
  zaka: {
    color: colors.goldLight,
  },
  pay: {
    color: colors.text,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
