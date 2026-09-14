import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getProgress } from '@/services/checklistGenerator';
import { deletePack, getAllPacks } from '@/services/storage';
import { TripPack } from '@/types';
import { colors } from '@/constants/theme';
import { getTemplate } from '@/data/tripTemplates';

export default function HistoryScreen() {
  const router = useRouter();
  const [packs, setPacks] = useState<TripPack[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllPacks().then(setPacks);
    }, [])
  );

  function confirmDelete(pack: TripPack) {
    Alert.alert('Delete pack?', `Remove "${pack.title}" from saved packs?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePack(pack.id);
          setPacks((prev) => prev.filter((p) => p.id !== pack.id));
        },
      },
    ]);
  }

  if (packs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTitle}>No saved packs yet</Text>
        <Text style={styles.emptyText}>Start a trip from the home screen!</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {packs.map((pack) => {
        const template = getTemplate(pack.tripType);
        const progress = getProgress(pack);
        return (
          <Pressable
            key={pack.id}
            style={styles.card}
            onPress={() => router.push(`/checklist/${pack.id}`)}
            onLongPress={() => confirmDelete(pack)}
          >
            <Text style={styles.emoji}>{template?.emoji ?? '📦'}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{pack.title}</Text>
              <Text style={styles.cardMeta}>
                {progress.packed}/{progress.total} packed ·{' '}
                {new Date(pack.createdAt).toLocaleDateString()}
              </Text>
              <View style={styles.miniBar}>
                <View
                  style={[styles.miniFill, { width: `${progress.percent}%` }]}
                />
              </View>
            </View>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        );
      })}
      <Text style={styles.hint}>Long press a pack to delete</Text>
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
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  backBtn: {
    padding: 12,
  },
  backText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  miniBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  arrow: {
    fontSize: 18,
    color: colors.primary,
    marginLeft: 8,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
