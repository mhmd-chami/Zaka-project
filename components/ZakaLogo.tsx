import { AppIcon } from '@/components/AppIcon';
import { StyleSheet, Text, View } from 'react-native';
import { colors, logoText } from '@/constants/theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function ZakaLogo({ size = 'md', showTagline = false }: Props) {
  const scale = size === 'sm' ? 0.78 : size === 'lg' ? 1.15 : 1;

  return (
    <View style={styles.wrap}>
      <View style={[styles.badge, { transform: [{ scale }] }]}>
        <AppIcon
          name='cedar'
          size={28}
          color={colors.goldLight}
          strokeWidth={1.8}
        />
      </View>
      <View style={{ transform: [{ scale }] }}>
        <Text style={styles.brand}>
          <Text style={styles.zaka}>Zaka</Text>
          <Text style={styles.pay}>Pay</Text>
        </Text>
        {showTagline ? (
          <Text style={styles.tagline}>
          Lebanon's wallet  ·  Send  ·  Shop  ·  Pay
          </Text>
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
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 1,
  },
  brand: {
    ...logoText,
    textAlign: 'center',
  },
  zaka: {
    color: colors.gold,
  },
  pay: {
    color: colors.text,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.2,
  },
});
