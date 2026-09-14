import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@/constants/theme';
import { getLocationById } from '@/data/locations';
import { getSession } from '@/services/authStorage';
import {
  acceptBranchTransfer,
  getPendingTransfersForLocation,
} from '@/services/branchTransferStorage';
import { BranchTransfer } from '@/types';

export default function AdminRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<BranchTransfer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState('');

  const load = useCallback(async () => {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      router.replace('/login');
      return;
    }
    if (!session.locationId) {
      setRequests([]);
      return;
    }

    const location = getLocationById(session.locationId);
    setLocationName(location?.name ?? 'Your branch');
    const pending = await getPendingTransfersForLocation(session.locationId);
    setRequests(pending);
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleAccept(item: BranchTransfer) {
    const session = await getSession();
    if (!session) return;

    Alert.alert(
      'Accept send request?',
      `Receive $${item.amount.toFixed(2)} from ${item.senderName} (${item.senderPhone})?\n\nRef: ${item.reference}\n\nThis will deduct from the sender and add to your branch wallet.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            const result = await acceptBranchTransfer(
              item.id,
              session.userId,
              session.locationId
            );
            if (!result.ok) {
              Alert.alert('Could not accept', result.error);
              return;
            }
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            Alert.alert(
              'Received ✅',
              `$${item.amount.toFixed(2)} added to your branch wallet.`
            );
            load();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Pending sends for {locationName}. Accept to receive money into your
        branch wallet.
      </Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No pending requests</Text>
            <Text style={styles.emptySub}>
              When users send money to your branch, they will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
              <Text style={styles.ref}>{item.reference}</Text>
            </View>
            <Text style={styles.name}>{item.senderName}</Text>
            <Text style={styles.phone}>{item.senderPhone}</Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
            <Pressable style={styles.acceptBtn} onPress={() => handleAccept(item)}>
              <Text style={styles.acceptText}>✅ Accept & receive</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  ref: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  phone: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  time: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
  },
  acceptBtn: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: colors.goldMuted,
  },
  acceptText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
