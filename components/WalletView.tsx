import { AppIcon, IconLabel } from '@/components/AppIcon';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '@/components/ActionButton';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionRow } from '@/components/TransactionRow';
import { colors, contentBottomPadding } from '@/constants/theme';
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
  showAddMoney?: boolean;
  showLogout?: boolean;
}

export function WalletView({
  session,
  showAddMoney = false,
  showLogout = true,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: contentBottomPadding(insets.bottom, 8) },
      ]}
    >
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
          <IconLabel icon="clock" style={styles.locationInfoText}>
            Open {location.hours} · Accept cash & ZakaPay transfers here
          </IconLabel>
        </View>
      ) : null}

      <View style={styles.actions}>
        <ActionButton
          icon="send"
          label="Send"
          onPress={() => router.push('/send')}
        />
        <ActionButton
          icon="receive"
          label="Receive"
          onPress={() => router.push('/receive')}
        />
        {showAddMoney ? (
          <ActionButton
            icon="add-money"
            label="Add Money"
            onPress={() => router.push('/add-money')}
          />
        ) : null}
      </View>

      {showLogout ? (
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.sectionSubtitle}>Your latest wallet activity</Text>
        </View>
        <Pressable
          style={styles.historyLink}
          onPress={() => {
            if (session.role === 'admin') router.push('/(admin)/history');
            else if (session.role === 'owner') router.push('/(owner)/history');
            else router.push('/(tabs)/history');
          }}
        >
          <Text style={styles.historyLinkText}>See all</Text>
          <AppIcon name="chevron-right" size={16} color={colors.primaryLight} />
        </Pressable>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 18,
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
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    padding: 13,
    marginBottom: 18,
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
    marginBottom: 22,
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  historyLink: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 7, paddingLeft: 10 },
  historyLinkText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
