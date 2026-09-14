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
import { StatCard } from '@/components/StatCard';
import { colors } from '@/constants/theme';
import { getAllUsers, getSession, logout } from '@/services/authStorage';
import { zakaLocations } from '@/data/locations';

export default function OwnerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    total: 0,
    locations: 0,
  });

  const load = useCallback(async () => {
    const session = await getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    if (session.role !== 'owner') {
      router.replace(session.role === 'admin' ? '/(admin)' : '/(tabs)');
      return;
    }

    const users = await getAllUsers();
    setStats({
      users: users.filter((u) => u.role === 'user').length,
      admins: users.filter((u) => u.role === 'admin').length,
      total: users.length,
      locations: zakaLocations.length,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function signOut() {
    Alert.alert('Sign out?', '', [
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerEmoji}>👑</Text>
        <Text style={styles.bannerTitle}>Owner Control Panel</Text>
        <Text style={styles.bannerSub}>
          Full access — manage admins, users, and system alerts
        </Text>
      </View>

      <View style={styles.stats}>
        <StatCard emoji="👤" label="Users" value={String(stats.users)} />
        <StatCard emoji="🛡️" label="Admins" value={String(stats.admins)} />
      </View>
      <View style={styles.stats}>
        <StatCard emoji="📊" label="Total accounts" value={String(stats.total)} />
        <StatCard emoji="🏪" label="Locations" value={String(stats.locations)} />
      </View>

      <Pressable style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  banner: { alignItems: 'center', marginBottom: 24 },
  bannerEmoji: { fontSize: 44, marginBottom: 8 },
  bannerTitle: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '800',
  },
  bannerSub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  logoutBtn: {
    marginTop: 24,
    alignItems: 'center',
    padding: 14,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
  },
});
