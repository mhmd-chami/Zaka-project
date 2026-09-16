import { AppIcon, IconLabel } from '@/components/AppIcon';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { VerificationDocumentPhoto } from '@/components/VerificationDocumentPhoto';
import { useSettings } from '@/contexts/SettingsContext';
import { getLocationById } from '@/data/locations';
import { api } from '@/services/api';
import { getSession } from '@/services/authStorage';
import { sendNotificationToUser } from '@/services/notificationStorage';
import {
  acceptBranchTransfer,
  getPendingTransfersForLocation,
} from '@/services/branchTransferStorage';
import {
  acceptCashOutRequest,
  getPendingCashOutsForLocation,
} from '@/services/cashOutStorage';
import { BranchTransfer, BranchVerificationRequest, CashOutRequest } from '@/types';

type RequestItem =
  | { kind: 'send'; data: BranchTransfer }
  | { kind: 'cashout'; data: CashOutRequest }
  | { kind: 'verify'; data: BranchVerificationRequest };

function requestTimestamp(item: RequestItem): number {
  if (item.kind === 'verify') return new Date(item.data.submittedAt).getTime();
  return new Date(item.data.createdAt).getTime();
}

export default function AdminRequestsScreen() {
  const router = useRouter();
  const { colors, t } = useSettings();
  const styles = makeStyles(colors);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [photoPreviewId, setPhotoPreviewId] = useState<string | null>(null);

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

    const [sends, cashOuts, verifyResult] = await Promise.all([
      getPendingTransfersForLocation(session.locationId),
      getPendingCashOutsForLocation(session.locationId),
      api<{ requests: BranchVerificationRequest[] }>('/verification/branch').catch(() => ({
        requests: [] as BranchVerificationRequest[],
      })),
    ]);

    const merged: RequestItem[] = [
      ...sends.map((data) => ({ kind: 'send' as const, data })),
      ...cashOuts.map((data) => ({ kind: 'cashout' as const, data })),
      ...verifyResult.requests.map((data) => ({ kind: 'verify' as const, data })),
    ].sort((a, b) => requestTimestamp(b) - requestTimestamp(a));

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

  async function handleVerifyDecision(item: BranchVerificationRequest, decision: 'approve' | 'reject') {
    const session = await getSession();
    if (!session) return;

    const docLabel =
      item.documentType === 'passport'
        ? 'Passport'
        : item.documentType === 'lebanese_id'
          ? 'Lebanese ID'
          : 'Document';

    Alert.alert(
      decision === 'approve' ? 'Approve identity?' : 'Reject verification?',
      `${item.userName} (${item.userPhone})\n${docLabel} · ${item.fullName ?? '—'}\nNo. ${item.documentNumber ?? '—'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: decision === 'approve' ? 'Approve' : 'Reject',
          style: decision === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const result = await api<{ verification: { status: string }; applicantUserId: string }>(
                `/verification/${item.id}/decision`,
                { method: 'POST', body: { decision } }
              );
              await sendNotificationToUser(
                result.applicantUserId,
                decision === 'approve' ? 'Identity verified' : 'Verification rejected',
                decision === 'approve'
                  ? `Your identity was approved by ${locationName}.`
                  : `Your identity verification was rejected. You can submit again with a valid document.`,
                'admin'
              );
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              load();
            } catch (err) {
              Alert.alert(
                'Could not update',
                err instanceof Error ? err.message : 'Try again.'
              );
            }
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
        Pending requests for {locationName}. Review identity checks, accept
        sends into your wallet, or confirm cash outs at the counter.
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
              Identity verifications, branch sends, and cash out requests will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          if (item.kind === 'verify') {
            const verify = item.data;
            const docLabel =
              verify.documentType === 'passport'
                ? 'Passport'
                : verify.documentType === 'lebanese_id'
                  ? 'Lebanese ID'
                  : 'Document';
            return (
              <View style={[styles.card, styles.verifyCard]}>
                <IconLabel icon="shield" style={styles.typeBadgeVerify}>Identity check</IconLabel>
                <Text style={styles.name}>{verify.userName}</Text>
                <Text style={styles.phone}>{verify.userPhone}</Text>
                <Text style={styles.verifyDetail}>{docLabel} · {verify.fullName ?? '—'}</Text>
                <Text style={styles.verifyDetail}>No. {verify.documentNumber ?? '—'}</Text>
                <Text style={styles.verifyDetail}>DOB {verify.dateOfBirth ?? '—'} · {verify.nationality ?? '—'}</Text>
                {verify.hasDocumentPhoto ? (
                  <View style={styles.photoWrap}>
                    <Text style={styles.photoLabel}>{t('adminVerifyDocumentPhoto')}</Text>
                    <VerificationDocumentPhoto
                      verificationId={verify.id}
                      imageStyle={styles.photoThumb}
                      onPress={() => setPhotoPreviewId(verify.id)}
                    />
                    <Text style={styles.photoHint}>{t('adminVerifyTapToEnlarge')}</Text>
                  </View>
                ) : null}
                <Text style={styles.time}>
                  {new Date(verify.submittedAt).toLocaleString()}
                </Text>
                <View style={styles.verifyActions}>
                  <Pressable
                    style={styles.rejectBtn}
                    onPress={() => handleVerifyDecision(verify, 'reject')}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </Pressable>
                  <Pressable
                    style={styles.approveBtn}
                    onPress={() => handleVerifyDecision(verify, 'approve')}
                  >
                    <IconLabel icon="check" style={styles.acceptText}>Approve</IconLabel>
                  </Pressable>
                </View>
              </View>
            );
          }

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

      <Modal
        visible={photoPreviewId !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setPhotoPreviewId(null)}
      >
        <Pressable style={styles.photoModalBackdrop} onPress={() => setPhotoPreviewId(null)}>
          {photoPreviewId ? (
            <ScrollView contentContainerStyle={styles.photoModalScroll}>
              <VerificationDocumentPhoto
                verificationId={photoPreviewId}
                imageStyle={styles.photoModalImage}
              />
            </ScrollView>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
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
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cashOutCard: {
      borderColor: colors.warning,
    },
    verifyCard: {
      borderColor: colors.primaryLight,
    },
    typeBadgeVerify: {
      color: colors.primaryLight,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    verifyDetail: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 4,
    },
    photoWrap: {
      marginTop: 12,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    photoLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      paddingHorizontal: 12,
      paddingTop: 10,
    },
    photoThumb: {
      width: '100%',
      height: 260,
      marginTop: 8,
      backgroundColor: colors.surface,
    },
    photoHint: {
      color: colors.textMuted,
      fontSize: 11,
      textAlign: 'center',
      paddingVertical: 8,
    },
    photoModalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    photoModalScroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: 24,
    },
    photoModalImage: {
      width: '100%',
      minHeight: 480,
    },
    verifyActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },
    approveBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    rejectBtn: {
      flex: 1,
      backgroundColor: 'rgba(255,99,118,0.08)',
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,99,118,0.35)',
    },
    rejectText: {
      color: colors.danger,
      fontSize: 15,
      fontWeight: '800',
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
      color: colors.background,
      fontSize: 15,
      fontWeight: '800',
    },
  });
}
