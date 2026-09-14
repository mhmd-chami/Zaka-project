import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeMap } from '@/components/SafeMap';
import { SOSModal } from '@/components/SOSModal';
import { getSafeSpotsNear } from '@/data/safeSpots';
import { colors } from '@/constants/theme';
import { useShakeSOS } from '@/hooks/useShakeSOS';
import {
  getCurrentPosition,
  watchPosition,
} from '@/services/locationService';
import { formatCoords, mapsLink } from '@/services/routeService';
import { getSession, saveSession } from '@/services/walkStorage';
import { Coordinates, WalkSession } from '@/types';

export default function WalkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<WalkSession | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [sosVisible, setSosVisible] = useState(false);

  const triggerSOS = useCallback(() => setSosVisible(true), []);
  useShakeSOS(triggerSOS, !!session && session.status === 'active');

  useEffect(() => {
    if (!id) return;
    getSession(id).then((s) => {
      if (!s) {
        Alert.alert('Session not found', '', [
          { text: 'OK', onPress: () => router.replace('/') },
        ]);
        return;
      }
      if (!s.safeSpots) {
        s.safeSpots = getSafeSpotsNear(s.start);
      }
      setSession(s);
      setUserLocation(s.start);
    });
  }, [id, router]);

  useEffect(() => {
    if (!session) return;

    let subscription: { remove: () => void } | null = null;

    watchPosition(setUserLocation).then((sub) => {
      subscription = sub;
    });

    getCurrentPosition(session.start).then(setUserLocation);

    return () => subscription?.remove();
  }, [session]);

  async function shareLiveLocation() {
    if (!session || !userLocation) return;

    const message =
      `🚶 SafeRoute — Live Walk\n\n` +
      `Walking to: ${session.destinationName}\n` +
      `My location: ${formatCoords(userLocation)}\n` +
      `${mapsLink(userLocation)}\n\n` +
      `Track me on Google Maps ↑`;

    await Share.share({ message, title: 'Live Location — SafeRoute' });
  }

  async function markHomeSafe() {
    if (!session) return;
    const updated = { ...session, status: 'completed' as const };
    await saveSession(updated);
    Alert.alert("You're home safe!", 'Walk completed successfully.', [
      { text: 'Done', onPress: () => router.replace('/') },
    ]);
  }

  async function confirmSOS() {
    if (!session) return;
    const updated = { ...session, status: 'sos' as const };
    await saveSession(updated);
    setSession(updated);
    setSosVisible(false);
  }

  if (!session || !userLocation) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading your safe route...</Text>
      </View>
    );
  }

  const safeSpots = session.safeSpots ?? getSafeSpotsNear(session.start);

  return (
    <View style={styles.container}>
      <SafeMap
        userLocation={userLocation}
        destination={session.destination}
        routeCoords={session.routeCoords}
        safeSpots={safeSpots}
      />

      <View
        style={[styles.topBar, { paddingTop: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.destBadge}>
          <Text style={styles.destText}>→ {session.destinationName}</Text>
        </View>
      </View>

      <View
        style={[styles.bottomPanel, { marginBottom: insets.bottom + 16 }]}
      >
        <Text style={styles.liveTag}>● LIVE TRACKING</Text>

        <View style={styles.actions}>
          <Pressable style={styles.shareBtn} onPress={shareLiveLocation}>
            <Text style={styles.shareText}>📤 Share location</Text>
          </Pressable>

          <Pressable style={styles.sosBtn} onPress={() => setSosVisible(true)}>
            <Text style={styles.sosText}>🚨 SOS</Text>
          </Pressable>
        </View>

        <Pressable style={styles.safeBtn} onPress={markHomeSafe}>
          <Text style={styles.safeText}>✅ I'm home safe</Text>
        </Pressable>

        <Text style={styles.hint}>Shake phone for emergency SOS</Text>
      </View>

      <SOSModal
        visible={sosVisible}
        location={userLocation}
        onDismiss={() => setSosVisible(false)}
        onConfirmSOS={confirmSOS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: colors.mapOverlay,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  destBadge: {
    backgroundColor: colors.mapOverlay,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
  },
  destText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: colors.mapOverlay,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  liveTag: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sosBtn: {
    backgroundColor: colors.dangerDark,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  safeBtn: {
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  safeText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 15,
  },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textSecondary,
  },
});
