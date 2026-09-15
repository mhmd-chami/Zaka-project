import { AppIcon } from '@/components/AppIcon';
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
        <View style={styles.badgeInner}>
          <AppIcon
            name="cedar"
            size={34}
            color={colors.goldLight}
            strokeWidth={1.7}
          />
        </View>
      </View>
      <View style={{ transform: [{ scale }] }}>
        <Text style={styles.brand}>
          <Text style={styles.zaka}>Zaka</Text>
          <Text style={styles.pay}>Pay</Text>
        </Text>
        {showTagline ? (
          <Text style={styles.tagline}>
            Lebanon&apos;s wallet  ·  Send  ·  Shop  ·  Pay
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
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  },
  badgeInner: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.1,
  },
});
