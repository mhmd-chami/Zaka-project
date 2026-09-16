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
import { useSettings } from '@/contexts/SettingsContext';
import { getAllUsers, getSession, logout } from '@/services/authStorage';
import { getProfileByUserId } from '@/services/walletStorage';
import { zakaLocations } from '@/data/locations';

const tileTints = {
  shield: 'rgba(245,185,66,0.14)',
  users: 'rgba(62,142,126,0.16)',
  megaphone: 'rgba(155,135,245,0.14)',
  bot: 'rgba(62,142,126,0.12)',
};

export default function OwnerDashboard() {
  const router = useRouter();
  const { colors } = useSettings();
  const styles = makeStyles(colors);
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    total: 0,
    locations: 0,
    float: 0,
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
    let float = 0;
    for (const u of users) {
      if (u.role !== 'user') continue;
      const profile = await getProfileByUserId(u.id);
      if (profile) float += profile.balance;
    }
    setStats({
      users: users.filter((u) => u.role === 'user').length,
      admins: users.filter((u) => u.role === 'admin').length,
      total: users.length,
      locations: zakaLocations.length,
      float,
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
          <AppIcon name="crown" size={28} color={colors.owner} />
        </View>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerTitle}>Owner control</Text>
          <Text style={styles.bannerSub}>Manage admins, users and system alerts</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <StatCard icon="user" label="Users" value={String(stats.users)} />
        <StatCard icon="shield" label="Admins" value={String(stats.admins)} />
      </View>
      <View style={styles.stats}>
        <StatCard icon="chart" label="Total accounts" value={String(stats.total)} />
        <StatCard icon="store" label="Locations" value={String(stats.locations)} />
      </View>

      <View style={styles.floatCard}>
        <View style={styles.floatIcon}>
          <AppIcon name="wallet" size={22} color={colors.owner} />
        </View>
        <View style={styles.floatCopy}>
          <Text style={styles.floatLabel}>Total user balances</Text>
          <Text style={styles.floatValue}>${stats.float.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Management</Text>
      <View style={styles.tiles}>
        <DashboardTile
          icon="shield"
          label="Manage roles"
          hint="Promote or demote admins"
          tint={tileTints.shield}
          onPress={() => router.push('/(owner)/admins')}
        />
        <DashboardTile
          icon="users"
          label="All accounts"
          hint="Every registered user"
          tint={tileTints.users}
          onPress={() => router.push('/(owner)/accounts')}
        />
      </View>
      <View style={styles.tiles}>
        <DashboardTile
          icon="megaphone"
          label="Broadcast"
          hint="Notify all members"
          tint={tileTints.megaphone}
          onPress={() => router.push('/(owner)/broadcast')}
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

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
    banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: 'rgba(155,135,245,0.22)', borderRadius: 18, padding: 18, marginBottom: 24 },
    bannerIcon: { width: 52, height: 52, borderRadius: 17, backgroundColor: 'rgba(155,135,245,0.13)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
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
    floatCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: 'rgba(155,135,245,0.22)',
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
      marginBottom: 24,
    },
    floatIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: 'rgba(155,135,245,0.13)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    floatCopy: { flex: 1 },
    floatLabel: { color: colors.textSecondary, fontSize: 13 },
    floatValue: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginTop: 2 },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1.1,
      marginBottom: 12,
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
}
