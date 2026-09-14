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

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, admins: 0, locations: 0 });

  const load = useCallback(async () => {
    const session = await getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    if (session.role === 'owner') {
      router.replace('/(owner)');
      return;
    }
    if (session.role !== 'admin') {
      router.replace('/(tabs)');
      return;
    }

    const users = await getAllUsers();
    setStats({
      users: users.filter((u) => u.role === 'user').length,
      admins: users.filter((u) => u.role === 'admin').length,
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
        <Text style={styles.bannerEmoji}>🛡️</Text>
        <Text style={styles.bannerTitle}>Admin Dashboard</Text>
        <Text style={styles.bannerSub}>
          Manage users, locations, and send notifications
        </Text>
      </View>

      <View style={styles.stats}>
        <StatCard emoji="👤" label="Users" value={String(stats.users)} />
        <StatCard emoji="🛡️" label="Admins" value={String(stats.admins)} />
      </View>
      <View style={styles.stats}>
        <StatCard
          emoji="🏪"
          label="Locations"
          value={String(stats.locations)}
        />
        <StatCard emoji="📢" label="Quick action" value="Notify" />
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
  banner: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bannerEmoji: { fontSize: 44, marginBottom: 8 },
  bannerTitle: {
    color: colors.goldLight,
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
