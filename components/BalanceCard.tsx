import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
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
      ]}
    >
      {isAdmin && locationName ? (
        <>
          <Text style={styles.locationBadge}>🏪 ZakaPay Location</Text>
          <Text style={styles.locationName}>{locationName}</Text>
          {locationAddress ? (
            <Text style={styles.locationAddr}>{locationAddress}</Text>
          ) : null}
        </>
      ) : isOwner ? (
        <Text style={styles.greeting}>👑 ZakaPay Owner Wallet</Text>
      ) : (
        <Text style={styles.greeting}>Hello, {name.split(' ')[0]} 👋</Text>
      )}

      <Text style={styles.label}>
        {isAdmin ? 'Location float balance' : 'Available balance'}
      </Text>
      <Text style={styles.balance}>${balance.toFixed(2)}</Text>
      <Text style={styles.phone}>{phone}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  cardAdmin: {
    backgroundColor: '#92400E',
  },
  cardOwner: {
    backgroundColor: '#5B21B6',
  },
  locationBadge: {
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  locationName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  locationAddr: {
    color: '#FDE68A',
    fontSize: 12,
    marginBottom: 12,
  },
  greeting: {
    color: '#DCFCE7',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    color: '#BBF7D0',
    fontSize: 13,
  },
  balance: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '800',
    marginTop: 4,
  },
  phone: {
    color: '#BBF7D0',
    fontSize: 13,
    marginTop: 12,
  },
});
