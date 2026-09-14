import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import { DestinationCard } from '@/components/DestinationCard';
import {
  DEMO_CENTER,
  getDestinationsNear,
  getSafeSpotsNear,
} from '@/data/safeSpots';
import { colors } from '@/constants/theme';
import {
  getCurrentPosition,
  requestLocationPermission,
} from '@/services/locationService';
import { fetchWalkingRoute } from '@/services/routeService';
import { saveSession } from '@/services/walkStorage';
import { Coordinates, DestinationPreset, WalkSession } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const [userHere, setUserHere] = useState<Coordinates>(DEMO_CENTER);
  const [destinations, setDestinations] = useState<DestinationPreset[]>(
    getDestinationsNear(DEMO_CENTER)
  );
  const [selected, setSelected] = useState<DestinationPreset>(
    getDestinationsNear(DEMO_CENTER)[0]
  );
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    (async () => {
      const granted = await requestLocationPermission();
      if (granted) {
        const pos = await getCurrentPosition(DEMO_CENTER);
        setUserHere(pos);
        const dests = getDestinationsNear(pos);
        setDestinations(dests);
        setSelected(dests[0]);
      } else {
        setDemoMode(true);
      }
    })();
  }, []);

  async function startWalk() {
    setLoading(true);
    try {
      let start = userHere;

      if (!demoMode) {
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert(
            'Location needed',
            'Enable location in settings, or use Demo Mode below.',
            [{ text: 'OK' }]
          );
          return;
        }
        start = await getCurrentPosition(userHere);
        setUserHere(start);
      }

      const routeCoords = await fetchWalkingRoute(start, selected.coordinate);
      const safeSpots = getSafeSpotsNear(start);

      const session: WalkSession = {
        id: `walk-${Date.now()}`,
        destinationName: selected.name,
        destination: selected.coordinate,
        start,
        routeCoords,
        safeSpots,
        startedAt: new Date().toISOString(),
        status: 'active',
      };

      await saveSession(session);
      router.push({ pathname: '/walk/[id]', params: { id: session.id } });
    } catch (e) {
      Alert.alert('Error', 'Could not start walk. Try Demo Mode.');
    } finally {
      setLoading(false);
    }
  }

  function toggleDemo() {
    const next = !demoMode;
    setDemoMode(next);
    if (next) {
      setUserHere(DEMO_CENTER);
      const dests = getDestinationsNear(DEMO_CENTER);
      setDestinations(dests);
      setSelected(dests[0]);
    }
  }

  const spotCount = getSafeSpotsNear(userHere).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🌙</Text>
        <Text style={styles.heroTitle}>Walk home safely</Text>
        <Text style={styles.heroSub}>
          Pick a destination, get a safe route, share live location, or shake
          for SOS.
        </Text>
      </View>

      {demoMode && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            📍 Demo Mode — using sample map near Beirut
          </Text>
        </View>
      )}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{spotCount}</Text>
          <Text style={styles.statLabel}>Safe spots</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>Live</Text>
          <Text style={styles.statLabel}>GPS share</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>SOS</Text>
          <Text style={styles.statLabel}>Shake alert</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Where are you going?</Text>
      <View style={styles.destRow}>
        {destinations.map((preset) => (
          <DestinationCard
            key={preset.id}
            preset={preset}
            selected={selected.id === preset.id}
            onPress={() => setSelected(preset)}
          />
        ))}
      </View>

      <Pressable
        style={[styles.startBtn, loading && styles.startBtnDisabled]}
        onPress={startWalk}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.startText}>🚶 Start Safe Walk</Text>
        )}
      </Pressable>

      <Pressable style={styles.demoBtn} onPress={toggleDemo}>
        <Text style={styles.demoBtnText}>
          {demoMode ? 'Use real GPS instead' : 'Use Demo Mode (no GPS needed)'}
        </Text>
      </Pressable>

      <Text style={styles.footer}>Zaka Project · Hackathon 2026</Text>
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
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  demoBanner: {
    backgroundColor: colors.primaryDark,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  demoText: {
    color: '#FFF',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.accent,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  destRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  startBtn: {
    backgroundColor: colors.primaryDark,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  startBtnDisabled: {
    opacity: 0.7,
  },
  startText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  demoBtn: {
    marginTop: 12,
    padding: 14,
    alignItems: 'center',
  },
  demoBtnText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
  },
});
