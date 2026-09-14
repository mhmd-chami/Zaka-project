import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ActionButton } from '@/components/ActionButton';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionRow } from '@/components/TransactionRow';
import { colors } from '@/constants/theme';
import { getLocationById } from '@/data/locations';
import { logout } from '@/services/authStorage';
import {
  getProfile,
  getTransactions,
  seedDemoTransactions,
} from '@/services/walletStorage';
import { AuthSession, Transaction, WalletProfile } from '@/types';

interface Props {
  session: AuthSession;
  showTopUp?: boolean;
  showLogout?: boolean;
}

export function WalletView({
  session,
  showTopUp = false,
  showLogout = true,
}: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);

  const location = getLocationById(session.locationId);

  const load = useCallback(async () => {
    try {
      await seedDemoTransactions();
      setProfile(await getProfile());
      const txs = await getTransactions();
      setRecent(txs.slice(0, 5));
    } catch {
      setProfile(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleLogout() {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  if (!profile) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BalanceCard
        balance={profile.balance}
        name={profile.name}
        phone={profile.phone}
        role={session.role}
        locationName={location?.name}
        locationAddress={location?.address}
      />

      {session.role === 'admin' && location ? (
        <View style={styles.locationInfo}>
          <Text style={styles.locationInfoText}>
            🕐 Open {location.hours} · Accept cash & ZakaPay transfers here
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <ActionButton
          emoji="📤"
          label="Send"
          onPress={() => router.push('/send')}
        />
        <ActionButton
          emoji="📥"
          label="Receive"
          onPress={() => router.push('/receive')}
        />
        {showTopUp ? (
          <ActionButton
            emoji="📱"
            label="Top Up"
            onPress={() => router.push('/topup')}
          />
        ) : null}
      </View>

      {showLogout ? (
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={styles.historyLink}
        onPress={() => {
          if (session.role === 'admin') router.push('/(admin)/history');
          else if (session.role === 'owner') router.push('/(owner)/history');
          else router.push('/(tabs)/history');
        }}
      >
        <Text style={styles.historyLinkText}>View full history →</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Recent activity</Text>
      {recent.length === 0 ? (
        <Text style={styles.empty}>No transactions yet</Text>
      ) : (
        recent.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  locationInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationInfoText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  logoutBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
    paddingVertical: 6,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  historyLink: {
    marginBottom: 16,
  },
  historyLinkText: {
    color: colors.goldLight,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.goldLight,
    marginBottom: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
