import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { TripCard } from '@/components/TripCard';
import { TRIP_TEMPLATES } from '@/data/tripTemplates';
import { createPackFromTrip } from '@/services/checklistGenerator';
import { savePack } from '@/services/storage';
import { TripType } from '@/types';
import { colors } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  async function startTrip(tripType: TripType) {
    const pack = createPackFromTrip(tripType);
    await savePack(pack);
    router.push(`/checklist/${pack.id}`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>📦</Text>
        <Text style={styles.heroTitle}>What's in your bag?</Text>
        <Text style={styles.heroSubtitle}>
          Pick your trip type and MedPack builds a smart checklist. Scan items
          with your camera as you pack.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Choose your trip</Text>

      {TRIP_TEMPLATES.map((template) => (
        <TripCard
          key={template.id}
          template={template}
          onPress={() => startTrip(template.id)}
        />
      ))}

      <Pressable style={styles.historyBtn} onPress={() => router.push('/history')}>
        <Text style={styles.historyText}>📋 View saved packs</Text>
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
    marginBottom: 28,
    paddingVertical: 16,
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
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  historyBtn: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  historyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
  },
});
