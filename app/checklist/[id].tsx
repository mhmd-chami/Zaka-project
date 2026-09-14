import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import { ChecklistItemRow } from '@/components/ChecklistItemRow';
import { ProgressBar } from '@/components/ProgressBar';
import { getTemplate } from '@/data/tripTemplates';
import { formatPackForShare, getProgress } from '@/services/checklistGenerator';
import { getPack, savePack } from '@/services/storage';
import { TripPack } from '@/types';
import { colors } from '@/constants/theme';

export default function ChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [pack, setPack] = useState<TripPack | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const data = await getPack(id);
    if (!data) {
      Alert.alert('Not found', 'This pack no longer exists.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
      return;
    }
    setPack(data);
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function updatePack(updated: TripPack) {
    setPack(updated);
    await savePack(updated);
  }

  function toggleItem(itemId: string) {
    if (!pack) return;
    const items = pack.items.map((item) =>
      item.id === itemId ? { ...item, packed: !item.packed } : item
    );
    updatePack({ ...pack, items });
  }

  function setItemPhoto(itemId: string, uri: string) {
    if (!pack) return;
    const items = pack.items.map((item) =>
      item.id === itemId ? { ...item, packed: true, photoUri: uri } : item
    );
    updatePack({ ...pack, items });
  }

  async function shareList() {
    if (!pack) return;
    const message = formatPackForShare(pack);

    if (Platform.OS === 'web') {
      await navigator.clipboard?.writeText(message);
      Alert.alert('Copied!', 'Checklist copied to clipboard.');
      return;
    }

    try {
      await Share.share({ message, title: `MedPack — ${pack.title}` });
    } catch {
      if (await Sharing.isAvailableAsync()) {
        // fallback handled by Share on mobile
      }
    }
  }

  if (!pack) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading checklist...</Text>
      </View>
    );
  }

  const template = getTemplate(pack.tripType);
  const progress = getProgress(pack);

  const grouped = pack.items.reduce<Record<string, typeof pack.items>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{template?.emoji ?? '📦'}</Text>
        <Text style={styles.title}>{pack.title}</Text>
      </View>

      <ProgressBar {...progress} />

      {Object.entries(grouped).map(([category, items]) => (
        <View key={category} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {items[0] ? getCategoryLabel(category) : category}
          </Text>
          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onToggle={() => toggleItem(item.id)}
              onPhoto={(uri) => setItemPhoto(item.id, uri)}
            />
          ))}
        </View>
      ))}

      <Pressable style={styles.shareBtn} onPress={shareList}>
        <Text style={styles.shareText}>📤 Share with family</Text>
      </Pressable>
    </ScrollView>
  );
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    medical: '💊 Medical',
    documents: '📄 Documents',
    essentials: '🎒 Essentials',
    tech: '📱 Tech',
    clothing: '👕 Clothing',
  };
  return labels[category] ?? category;
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shareBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  shareText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
