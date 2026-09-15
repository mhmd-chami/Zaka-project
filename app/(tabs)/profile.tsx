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

function roleEmoji(role: AuthSession['role']): string {
  switch (role) {
    case 'owner':
      return '👑';
    case 'admin':
      return '🏪';
    default:
      return '👤';
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
        <Text style={styles.avatar}>{roleEmoji(session.role)}</Text>
      </View>
      <Text style={styles.name}>{profile.name}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{roleLabel(session.role)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>ZakaPay number</Text>
        <Text style={styles.cardValue}>{profile.phone}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Wallet balance</Text>
        <Text style={styles.balance}>${profile.balance.toFixed(2)}</Text>
      </View>

      <Pressable style={styles.menuItem} onPress={() => router.push('/receive')}>
        <Text style={styles.menuEmoji}>📥</Text>
        <View style={styles.menuBody}>
          <Text style={styles.menuTitle}>Receive & QR</Text>
          <Text style={styles.menuSub}>Your payment number and QR code</Text>
        </View>
        <Text style={styles.menuArrow}>→</Text>
      </Pressable>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push('/(tabs)/history')}
      >
        <Text style={styles.menuEmoji}>📋</Text>
        <View style={styles.menuBody}>
          <Text style={styles.menuTitle}>Transaction history</Text>
          <Text style={styles.menuSub}>View all past activity</Text>
        </View>
        <Text style={styles.menuArrow}>→</Text>
      </Pressable>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign out</Text>
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
    padding: 20,
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatar: {
    fontSize: 40,
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  roleText: {
    color: colors.goldLight,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  balance: {
    color: colors.income,
    fontSize: 28,
    fontWeight: '800',
  },
  menuItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
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
  menuArrow: {
    color: colors.goldLight,
    fontSize: 18,
    fontWeight: '700',
  },
  logoutBtn: {
    width: '100%',
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '800',
  },
});
