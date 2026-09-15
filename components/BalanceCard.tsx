import { AppIcon, IconLabel } from '@/components/AppIcon';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows } from '@/constants/theme';
import { UserRole } from '@/types';

interface Props {
  balance: number;
  name: string;
  phone: string;
  role?: UserRole;
  locationName?: string;
  locationAddress?: string;
}

export function BalanceCard({
  balance,
  name,
  phone,
  role = 'user',
  locationName,
  locationAddress,
}: Props) {
  const isAdmin = role === 'admin';
  const isOwner = role === 'owner';
  const accent = isAdmin
    ? colors.warning
    : isOwner
      ? colors.owner
      : colors.primaryLight;

  return (
    <View
      style={[
        styles.card,
        isAdmin && styles.cardAdmin,
        isOwner && styles.cardOwner,
        shadows.card,
      ]}
    >
      <View style={styles.pattern}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.identity}>
            {isAdmin && locationName ? (
              <>
                <View style={[styles.badge, { backgroundColor: `${accent}1F` }]}>
                  <IconLabel
                    icon="store"
                    color={accent}
                    style={[styles.badgeText, { color: accent }]}
                  >
                    Branch wallet
                  </IconLabel>
                </View>
                <Text style={styles.locationName}>{locationName}</Text>
              </>
            ) : isOwner ? (
              <View style={[styles.badge, { backgroundColor: `${accent}1F` }]}>
                <IconLabel
                  icon="crown"
                  color={accent}
                  style={[styles.badgeText, { color: accent }]}
                >
                  Owner wallet
                </IconLabel>
              </View>
            ) : (
              <Text style={styles.greeting}>
                Good to see you, {name.split(' ')[0]}
              </Text>
            )}
          </View>

          <View style={styles.walletMark}>
            <AppIcon name="wallet" size={21} color={accent} />
          </View>
        </View>

        <Text style={styles.label}>
          {isAdmin ? 'Location float' : 'Available balance'}
        </Text>
        <Text style={styles.balance} adjustsFontSizeToFit numberOfLines={1}>
          ${balance.toFixed(2)}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.phoneRow}>
            <AppIcon
              name="smartphone"
              size={14}
              color="rgba(255,255,255,0.62)"
            />
            <Text style={styles.phone}>{phone}</Text>
          </View>

          {isAdmin && locationAddress ? (
            <Text style={styles.locationAddr} numberOfLines={1}>
              {locationAddress}
            </Text>
          ) : (
            <View style={styles.activePill}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#123B2B',
    borderRadius: radius.xl,
    marginBottom: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(101,227,167,0.25)',
  },
  cardAdmin: {
    backgroundColor: '#392B13',
    borderColor: 'rgba(245,185,66,0.28)',
  },
  cardOwner: {
    backgroundColor: '#2C2450',
    borderColor: 'rgba(155,135,245,0.28)',
  },
  pattern: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -58,
    right: -38,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
  circle2: {
    position: 'absolute',
    bottom: -72,
    left: -38,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(235,203,104,0.08)',
  },
  content: {
    minHeight: 200,
    padding: 22,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 46,
  },
  identity: {
    flex: 1,
    paddingRight: 12,
  },
  walletMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginBottom: 7,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  locationName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  greeting: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  label: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 10,
  },
  balance: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginTop: 1,
    letterSpacing: -1.3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phone: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  locationAddr: {
    flex: 1,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11,
    textAlign: 'right',
    marginLeft: 10,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.14)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
  },
  activeText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: '700',
  },
});
