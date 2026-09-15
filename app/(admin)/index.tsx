import { AppIcon } from '@/components/AppIcon';
import { DashboardTile } from '@/components/DashboardTile';
import { StatCard } from '@/components/StatCard';
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
import { colors } from '@/constants/theme';
import { getAllUsers, getSession, logout } from '@/services/authStorage';
import { getPendingTransfersForLocation } from '@/services/branchTransferStorage';
import { getPendingCashOutsForLocation } from '@/services/cashOutStorage';
import { zakaLocations } from '@/data/locations';

const tileTints = {
  receive: 'rgba(62,142,126,0.16)',
  users: 'rgba(245,185,66,0.14)',
  megaphone: 'rgba(255,99,118,0.12)',
  bot: 'rgba(62,142,126,0.12)',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, admins: 0, locations: 0, pending: 0 });

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
    let pending = 0;
    if (session.locationId) {
      const [transfers, cashOuts] = await Promise.all([
        getPendingTransfersForLocation(session.locationId),
        getPendingCashOutsForLocation(session.locationId),
      ]);
      pending = transfers.length + cashOuts.length;
    }
    setStats({
      users: users.filter((u) => u.role === 'user').length,
      admins: users.filter((u) => u.role === 'admin').length,
      locations: zakaLocations.length,
      pending,
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
        <StatCard
          icon="inbox"
          label="Pending requests"
          value={String(stats.pending)}
        />
      </View>

      <Text style={styles.sectionTitle}>Branch operations</Text>
      <View style={styles.tiles}>
        <DashboardTile
          icon="receive"
          label="Requests"
          hint="Review incoming activity"
          badge={stats.pending}
          tint={tileTints.receive}
          onPress={() => router.push('/(admin)/requests')}
        />
        <DashboardTile
          icon="users"
          label="Members"
          hint="All platform users"
          tint={tileTints.users}
          onPress={() => router.push('/(admin)/members')}
        />
      </View>
      <View style={styles.tiles}>
        <DashboardTile
          icon="megaphone"
          label="Send alert"
          hint="Notify branch members"
          tint={tileTints.megaphone}
          onPress={() => router.push('/(admin)/alerts')}
        />
        <DashboardTile
          icon="bot"
          label="Zaka assistant"
          hint="Smart support chat"
          tint={tileTints.bot}
          onPress={() => router.push('/support-agent')}
        />
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
    borderRadius: 18,
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
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 12,
    marginTop: 12,
  },
  tiles: {
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
