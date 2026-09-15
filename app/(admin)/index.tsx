import { AppIcon } from '@/components/AppIcon';
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
        <View style={styles.bannerIcon}>
          <AppIcon name="shield" size={28} color={colors.warning} />
        </View>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerTitle}>Admin dashboard</Text>
          <Text style={styles.bannerSub}>Manage branches, members and alerts</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <StatCard icon="user" label="Users" value={String(stats.users)} />
        <StatCard icon="shield" label="Admins" value={String(stats.admins)} />
      </View>
      <View style={styles.stats}>
        <StatCard
          icon="store"
          label="Locations"
          value={String(stats.locations)}
        />
        <StatCard icon="megaphone" label="Quick action" value="Notify" />
      </View>

      <Pressable style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: 'rgba(245,185,66,0.2)',
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
  },
  bannerIcon: { width: 52, height: 52, borderRadius: 17, backgroundColor: 'rgba(245,185,66,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  bannerCopy: { flex: 1 },
  bannerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.35,
  },
  bannerSub: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 18,
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
    borderRadius: 14,
    backgroundColor: 'rgba(255,99,118,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,99,118,0.25)',
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
  },
});
