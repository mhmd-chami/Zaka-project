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
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.identity}>
            {isAdmin && locationName ? (
              <>
                <View style={[styles.badge, { backgroundColor: `${accent}1F` }]}>
                  <IconLabel
                    icon='store'
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
                  icon='crown'
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
            <AppIcon name='wallet' size={18} color={accent} />
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
              name='smartphone'
              size={13}
              color='rgba(255,255,255,0.55)'
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
    borderRadius: radius.lg,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(101,227,167,0.20)',
  },
  cardAdmin: {
    backgroundColor: '#392B13',
    borderColor: 'rgba(245,185,66,0.22)',
  },
  cardOwner: {
    backgroundColor: '#2C2450',
    borderColor: 'rgba(155,135,245,0.22)',
  },
  content: {
    minHeight: 190,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  identity: {
    flex: 1,
    paddingRight: 10,
  },
  walletMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  locationName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  greeting: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  label: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 8,
  },
  balance: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    marginTop: 1,
    letterSpacing: -1.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phone: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '600',
  },
  locationAddr: {
    flex: 1,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    textAlign: 'right',
    marginLeft: 8,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primaryLight,
  },
  activeText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 9,
    fontWeight: '700',
  },
});
