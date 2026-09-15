import { AppIcon, IconLabel } from '@/components/AppIcon';
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
import {
  acceptCashOutRequest,
  getPendingCashOutsForLocation,
} from '@/services/cashOutStorage';
import { BranchTransfer, CashOutRequest } from '@/types';

type RequestItem =
  | { kind: 'send'; data: BranchTransfer }
  | { kind: 'cashout'; data: CashOutRequest };

export default function AdminRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
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

    const [sends, cashOuts] = await Promise.all([
      getPendingTransfersForLocation(session.locationId),
      getPendingCashOutsForLocation(session.locationId),
    ]);

    const merged: RequestItem[] = [
      ...sends.map((data) => ({ kind: 'send' as const, data })),
      ...cashOuts.map((data) => ({ kind: 'cashout' as const, data })),
    ].sort(
      (a, b) =>
        new Date(b.data.createdAt).getTime() -
        new Date(a.data.createdAt).getTime()
    );

    setRequests(merged);
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

  async function handleAcceptSend(item: BranchTransfer) {
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
              'Received',
              `$${item.amount.toFixed(2)} added to your branch wallet.`
            );
            load();
          },
        },
      ]
    );
  }

  async function handleAcceptCashOut(item: CashOutRequest) {
    const session = await getSession();
    if (!session) return;

    Alert.alert(
      'Confirm cash out?',
      `Hand $${item.amount.toFixed(2)} in cash to ${item.userName} (${item.userPhone})?\n\nRef: ${item.reference}\n\nThis will deduct from their wallet.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & pay cash',
          onPress: async () => {
            const result = await acceptCashOutRequest(
              item.id,
              session.userId,
              session.locationId
            );
            if (!result.ok) {
              Alert.alert('Could not complete', result.error);
              return;
            }
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            Alert.alert(
              'Cash out done',
              `$${item.amount.toFixed(2)} handed to ${item.userName}.`
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
        Pending requests for {locationName}. Accept sends into your wallet or
        confirm cash outs at the counter.
      </Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => `${item.kind}-${item.data.id}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
              <AppIcon name="inbox" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No pending requests</Text>
            <Text style={styles.emptySub}>
              Branch sends and cash out requests will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          if (item.kind === 'send') {
            const send = item.data;
            return (
              <View style={styles.card}>
                <IconLabel icon="receive" style={styles.typeBadge}>Branch send</IconLabel>
                <View style={styles.cardTop}>
                  <Text style={styles.amount}>${send.amount.toFixed(2)}</Text>
                  <Text style={styles.ref}>{send.reference}</Text>
                </View>
                <Text style={styles.name}>{send.senderName}</Text>
                <Text style={styles.phone}>{send.senderPhone}</Text>
                <Text style={styles.time}>
                  {new Date(send.createdAt).toLocaleString()}
                </Text>
                <Pressable
                  style={styles.acceptBtn}
                  onPress={() => handleAcceptSend(send)}
                >
                  <IconLabel icon="check" style={styles.acceptText}>
                    Accept & receive
                  </IconLabel>
                </Pressable>
              </View>
            );
          }

          const cashOut = item.data;
          return (
            <View style={[styles.card, styles.cashOutCard]}>
              <IconLabel icon="banknote" style={styles.typeBadgeCash}>Cash out</IconLabel>
              <View style={styles.cardTop}>
                <Text style={styles.amount}>${cashOut.amount.toFixed(2)}</Text>
                <Text style={styles.ref}>{cashOut.reference}</Text>
              </View>
              <Text style={styles.name}>{cashOut.userName}</Text>
              <Text style={styles.phone}>{cashOut.userPhone}</Text>
              <Text style={styles.time}>
                {new Date(cashOut.createdAt).toLocaleString()}
              </Text>
              <Pressable
                style={styles.cashOutBtn}
                onPress={() => handleAcceptCashOut(cashOut)}
              >
                <IconLabel icon="banknote" style={styles.acceptText}>
                  Confirm & hand cash
                </IconLabel>
              </Pressable>
            </View>
          );
        }}
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
  emptyIcon: {
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
  cashOutCard: {
    borderColor: colors.warning,
  },
  typeBadge: {
    color: colors.goldLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  typeBadgeCash: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
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
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cashOutBtn: {
    backgroundColor: colors.adminDark,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: colors.warning,
  },
  acceptText: {
    color: '#06130D',
    fontSize: 15,
    fontWeight: '800',
  },
});
