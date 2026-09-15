import { AppIcon, IconLabel } from '@/components/AppIcon';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PinGateModal } from '@/components/PinGateModal';
import { QrScannerModal } from '@/components/QrScannerModal';
import { MoneyActionIcon } from '@/components/MoneyActionIcon';
import { colors, contentBottomPadding } from '@/constants/theme';
import { getLocationById, zakaLocations, ZakaLocation } from '@/data/locations';
import { getSession } from '@/services/authStorage';
import {
  getDefaultSendMode,
  getProfileSettings,
  verifySendPin,
} from '@/services/profileSettingsStorage';
import { sendCashAtLocation, sendMoneyP2P } from '@/services/walletStorage';
import { AuthSession, SendMode } from '@/types';

const QUICK = [5, 10, 20, 50];

export default function SendScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<SendMode>('p2p');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState<ZakaLocation>(zakaLocations[0]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingSend, setPendingSend] = useState<'p2p' | 'cash' | null>(null);

  const isStaff = session?.role === 'admin' || session?.role === 'owner';
  const adminLocation = getLocationById(session?.locationId);

  useEffect(() => {
    getSession().then(setSession);
    getDefaultSendMode().then(setMode);
  }, []);

  async function handleP2PSend() {
    const value = parseFloat(amount);
    if (!phone.trim()) {
      Alert.alert('Missing number', 'Enter the recipient ZakaPay number.');
      return;
    }
    if (!value || value <= 0) {
      Alert.alert('Invalid amount', 'Enter how much to send.');
      return;
    }

    setLoading(true);
    const result = await sendMoneyP2P(phone.trim(), value);
    setLoading(false);

    if (!result.ok) {
      Alert.alert('Send failed', result.error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Sent instantly!',
      `$${value.toFixed(2)} sent to ${result.recipientName ?? phone.trim()} via ZakaPay.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  async function requestSend() {
    const settings = await getProfileSettings();
    if (settings?.requirePinForSend && settings.pinCode) {
      setPendingSend(mode === 'p2p' ? 'p2p' : 'cash');
      setPinModalOpen(true);
      return;
    }
    if (mode === 'p2p') await handleP2PSend();
    else await handleCashSend();
  }

  async function handlePinSubmit(pin: string) {
    const ok = await verifySendPin(pin);
    if (!ok) {
      Alert.alert('Wrong PIN', 'Try again.');
      return;
    }
    setPinModalOpen(false);
    const action = pendingSend;
    setPendingSend(null);
    if (action === 'p2p') await handleP2PSend();
    else if (action === 'cash') await handleCashSend();
  }

  async function handleCashSend() {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      Alert.alert('Invalid amount', 'Enter the cash amount.');
      return;
    }

    setLoading(true);
    const result = await sendCashAtLocation(
      value,
      location.id,
      location.name
    );
    setLoading(false);

    if (!result.ok) {
      Alert.alert('Could not create send', result.error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Request sent to branch',
      `$${value.toFixed(2)} will be sent from your wallet once the branch accepts.\n\n` +
        `${location.name}\n${location.address}\n` +
        `Hours: ${location.hours}\n\n` +
        `Reference: ${result.reference}\n\n` +
        `Show this code to the agent at the branch.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: contentBottomPadding(insets.bottom, 20) },
        ]}
      >
        {session?.role === 'admin' && adminLocation ? (
          <View style={styles.staffBanner}>
            <IconLabel icon="store" style={styles.staffBannerText}>
              Sending from {adminLocation.name} location wallet
            </IconLabel>
          </View>
        ) : null}
        {session?.role === 'owner' ? (
          <View style={[styles.staffBanner, styles.ownerBanner]}>
            <IconLabel icon="crown" style={styles.staffBannerText}>
              Sending from owner wallet
            </IconLabel>
          </View>
        ) : null}

        <Text style={styles.heading}>
          {isStaff ? 'Send to customer' : 'Choose send type'}
        </Text>

        {!isStaff ? (
        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeBtn, mode === 'p2p' && styles.modeBtnActive]}
            onPress={() => setMode('p2p')}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'p2p' }}
          >
            <View style={styles.modeIcon}>
              <MoneyActionIcon action="send" size={48} />
            </View>
            <Text style={[styles.modeTitle, mode === 'p2p' && styles.modeTitleActive]}>
              ZakaPay → ZakaPay
            </Text>
            <Text style={styles.modeSub}>User to user · instant</Text>
          </Pressable>

          <Pressable
            style={[styles.modeBtn, mode === 'location' && styles.modeBtnActive]}
            onPress={() => setMode('location')}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'location' }}
          >
            <View style={[styles.modeIcon, styles.branchModeIcon]}>
              <AppIcon name="store" size={28} color={colors.goldLight} strokeWidth={2.1} />
            </View>
            <Text
              style={[styles.modeTitle, mode === 'location' && styles.modeTitleActive]}
            >
              Cash at location
            </Text>
            <Text style={styles.modeSub}>Bring cash to agent</Text>
          </Pressable>
        </View>
        ) : null}

        {mode === 'p2p' || isStaff ? (
          <View style={styles.form}>
            <Text style={styles.info}>
              {isStaff
                ? 'Pay out dollars from your wallet to a customer ZakaPay number.'
                : 'Send dollars instantly from your wallet to another ZakaPay user.'}
            </Text>
            <Text style={styles.label}>
              {isStaff ? 'Customer phone number' : 'Recipient ZakaPay number'}
            </Text>
            <View style={styles.phoneRow}>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="+961 70 000 000"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Pressable
                style={styles.scanBtn}
                onPress={() => setScannerOpen(true)}
              >
                <AppIcon name="scan" size={22} />
                <Text style={styles.scanLabel}>Scan QR</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.info}>
              Choose a branch and amount. The branch agent must accept before
              money leaves your wallet and is received at the location.
            </Text>

            <Text style={styles.label}>Choose branch</Text>
            {zakaLocations.map((loc) => (
              <Pressable
                key={loc.id}
                style={[
                  styles.locationCard,
                  location.id === loc.id && styles.locationSelected,
                ]}
                onPress={() => setLocation(loc)}
                accessibilityRole="button"
                accessibilityState={{ selected: location.id === loc.id }}
              >
                <View style={styles.locationHeader}>
                  <Text style={styles.locationName}>{loc.name}</Text>
                  <View
                    style={[
                      styles.selection,
                      location.id === loc.id && styles.selectionActive,
                    ]}
                  >
                    {location.id === loc.id ? (
                      <AppIcon name="check" size={14} color={colors.background} strokeWidth={2.8} />
                    ) : null}
                  </View>
                </View>
                <Text style={styles.locationAddr}>{loc.address}</Text>
                <IconLabel icon="clock" style={styles.locationHours}>{loc.hours}</IconLabel>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.label}>Amount ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <Pressable
              key={q}
              style={[styles.quickBtn, amount === String(q) && styles.quickBtnActive]}
              onPress={() => setAmount(String(q))}
            >
              <Text style={[styles.quickText, amount === String(q) && styles.quickTextActive]}>${q}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.sendBtn, loading && styles.disabled]}
          onPress={requestSend}
          disabled={loading}
        >
          <IconLabel
            icon={mode === 'p2p' || isStaff ? 'send' : 'store'}
            style={styles.sendText}
          >
            {mode === 'p2p' || isStaff
              ? 'Send to ZakaPay user'
              : 'Send to branch'}
          </IconLabel>
        </Pressable>
      </ScrollView>

      <QrScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(data) => {
          setPhone(data.phone);
          if (data.amount) setAmount(String(data.amount));
        }}
      />

      <PinGateModal
        visible={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setPendingSend(null);
        }}
        onSubmit={handlePinSubmit}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 20, paddingTop: 18 },
  staffBanner: {
    backgroundColor: colors.adminDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,185,66,0.26)',
  },
  ownerBanner: {
    backgroundColor: colors.ownerDark,
  },
  staffBannerText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  heading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  modeIcon: {
    marginBottom: 6,
  },
  branchModeIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: `${colors.goldLight}55`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  modeTitleActive: {
    color: colors.text,
  },
  modeSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  form: {
    marginBottom: 8,
  },
  info: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  phoneInput: {
    flex: 1,
  },
  scanBtn: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    minWidth: 72,
  },
  scanLabel: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  locationCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  locationName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selection: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  locationAddr: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  locationHours: {
    color: colors.accentSoft,
    fontSize: 11,
    marginTop: 4,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickBtnActive: { backgroundColor: colors.primarySoft, borderColor: 'rgba(42,140,137,0.35)' },
  quickText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  quickTextActive: { color: colors.primaryLight },
  sendBtn: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  disabled: { opacity: 0.7 },
  sendText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
});
