import { AppIcon, IconLabel, type IconName } from '@/components/AppIcon';
import { MoneyActionIcon } from '@/components/MoneyActionIcon';
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
import { colors, contentBottomPadding } from '@/constants/theme';
import { getSession, logout } from '@/services/authStorage';
import { getProfile } from '@/services/walletStorage';
import { AuthSession, WalletProfile } from '@/types';

function roleLabel(role: AuthSession['role']): string {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Branch admin';
    default:
      return 'ZakaPay user';
  }
}

function roleIcon(role: AuthSession['role']): IconName {
  switch (role) {
    case 'owner':
      return 'crown';
    case 'admin':
      return 'store';
    default:
      return 'user';
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<WalletProfile | null>(null);

  const load = useCallback(async () => {
    const s = await getSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    setSession(s);
    setProfile(await getProfile());
  }, [router]);

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
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  if (!session || !profile) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: contentBottomPadding(insets.bottom, 20) },
      ]}
    >
      <View style={styles.avatarRing}>
        <AppIcon name={roleIcon(session.role)} size={40} />
      </View>
      <Text style={styles.name}>{profile.name}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{roleLabel(session.role)}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryBalance}>
          <Text style={styles.cardLabel}>Wallet balance</Text>
          <Text style={styles.balance}>${profile.balance.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.numberRow}>
          <View style={styles.numberIcon}>
            <AppIcon name="smartphone" size={19} color={colors.primaryLight} />
          </View>
          <View>
            <Text style={styles.cardLabel}>ZakaPay number</Text>
            <Text style={styles.cardValue}>{profile.phone}</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.menuItem} onPress={() => router.push('/receive')}>
        <View style={styles.menuIcon}>
          <MoneyActionIcon action="receive" size={46} />
        </View>
        <View style={styles.menuBody}>
          <Text style={styles.menuTitle}>Receive & QR</Text>
          <Text style={styles.menuSub}>Your payment number and QR code</Text>
        </View>
        <AppIcon name="chevron-right" size={20} />
      </Pressable>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push('/(tabs)/history')}
      >
        <View style={styles.menuIcon}>
          <View style={styles.historyIcon}>
            <AppIcon name="history" size={23} color={colors.primaryLight} />
          </View>
        </View>
        <View style={styles.menuBody}>
          <Text style={styles.menuTitle}>Transaction history</Text>
          <Text style={styles.menuSub}>View all past activity</Text>
        </View>
        <AppIcon name="chevron-right" size={20} />
      </Pressable>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <IconLabel icon="logout" style={styles.logoutText}>Sign out</IconLabel>
      </Pressable>
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
    alignItems: 'center',
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
  avatarRing: {
    width: 82,
    height: 82,
    borderRadius: 27,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(40,199,128,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  name: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.6,
  },
  roleBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(40,199,128,0.24)',
    marginBottom: 24,
  },
  roleText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryBalance: { alignItems: 'flex-start' },
  summaryDivider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numberIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  cardLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  balance: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  menuItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: {
    marginRight: 13,
  },
  historyIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  menuBody: {
    flex: 1,
  },
  menuTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  menuSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    width: '100%',
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,99,118,0.45)',
    backgroundColor: 'rgba(255,99,118,0.07)',
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '800',
  },
});
