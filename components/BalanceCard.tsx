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

  return (
    <View
      style={[
        styles.card,
        isAdmin && styles.cardAdmin,
        isOwner && styles.cardOwner,
        shadows.card,
      ]}
    >
      <View style={styles.goldBar} />
      <View style={styles.pattern}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <View style={styles.content}>
        {isAdmin && locationName ? (
          <>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🏪 BRANCH AGENT</Text>
            </View>
            <Text style={styles.locationName}>{locationName}</Text>
            {locationAddress ? (
              <Text style={styles.locationAddr}>{locationAddress}</Text>
            ) : null}
          </>
        ) : isOwner ? (
          <View style={styles.badgeOwner}>
            <Text style={styles.badgeText}>👑 OWNER WALLET</Text>
          </View>
        ) : (
          <Text style={styles.greeting}>Hello, {name.split(' ')[0]} 👋</Text>
        )}

        <Text style={styles.label}>
          {isAdmin ? 'Location float balance' : 'Available balance'}
        </Text>
        <Text style={styles.balance}>${balance.toFixed(2)}</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.phoneDot}>●</Text>
          <Text style={styles.phone}>{phone}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.xl,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  cardAdmin: {
    backgroundColor: colors.adminDark,
  },
  cardOwner: {
    backgroundColor: colors.ownerDark,
  },
  goldBar: {
    height: 4,
    backgroundColor: colors.gold,
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  content: {
    padding: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212,175,55,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: 10,
  },
  badgeOwner: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(167,139,250,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: 10,
  },
  badgeText: {
    color: colors.goldLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  locationName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  locationAddr: {
    color: colors.goldLight,
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.9,
  },
  greeting: {
    color: colors.accentSoft,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balance: {
    color: '#FFF',
    fontSize: 44,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  phoneDot: {
    color: colors.gold,
    fontSize: 8,
  },
  phone: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
});
