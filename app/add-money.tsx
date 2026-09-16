import { AppIcon, IconLabel } from '@/components/AppIcon';
import * as Haptics from 'expo-haptics';
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
import { PaymentQrCode } from '@/components/PaymentQrCode';
import { contentBottomPadding } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { getSession } from '@/services/authStorage';
import { addMoneyViaCard, getProfile } from '@/services/walletStorage';
import { AddMoneyMode, AuthSession, WalletProfile } from '@/types';

const QUICK = [20, 50, 100, 200];

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function AddMoneyScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useSettings();
  const styles = makeStyles(colors);
  const [mode, setMode] = useState<AddMoneyMode>('qr');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [qrAmount, setQrAmount] = useState('');
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setSession(await getSession());
      setProfile(await getProfile());
    })();
  }, []);

  const parsedQrAmount = parseFloat(qrAmount);
  const qrRequestAmount =
    parsedQrAmount && parsedQrAmount > 0 ? parsedQrAmount : undefined;

  async function handleCardDeposit() {
    const value = parseFloat(amount);
    const digits = cardNumber.replace(/\D/g, '');
    const cvvDigits = cvv.replace(/\D/g, '');

    if (!value || value <= 0) {
      Alert.alert('Invalid amount', 'Enter how much to add.');
      return;
    }
    if (digits.length < 16) {
      Alert.alert('Invalid card', 'Enter a 16-digit card number.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      Alert.alert('Invalid expiry', 'Use MM/YY format.');
      return;
    }
    if (cvvDigits.length < 3) {
      Alert.alert('Invalid CVV', 'Enter the 3-digit security code.');
      return;
    }

    setLoading(true);
    const result = await addMoneyViaCard(value, digits.slice(-4));
    setLoading(false);

    if (!result.ok) {
      Alert.alert('Deposit failed', result.error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfile(await getProfile());
    setAmount('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    Alert.alert(
      'Money added!',
      `$${value.toFixed(2)} was added to your wallet from your card.`
    );
  }

  if (!profile) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
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
        <Text style={styles.heading}>Add money to your wallet</Text>
        <Text style={styles.subheading}>
          Receive payments via QR or fund your balance with a credit card.
        </Text>

        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeBtn, mode === 'qr' && styles.modeBtnActive]}
            onPress={() => setMode('qr')}
          >
            <View style={styles.modeIcon}>
              <AppIcon name="scan" size={24} color={mode === 'qr' ? colors.goldLight : colors.textSecondary} />
            </View>
            <Text
              style={[styles.modeTitle, mode === 'qr' && styles.modeTitleActive]}
            >
              QR receive
            </Text>
            <Text style={styles.modeSub}>Others scan to pay you</Text>
          </Pressable>

          <Pressable
            style={[styles.modeBtn, mode === 'card' && styles.modeBtnActive]}
            onPress={() => setMode('card')}
          >
            <View style={styles.modeIcon}>
              <AppIcon name="credit-card" size={24} color={mode === 'card' ? colors.goldLight : colors.textSecondary} />
            </View>
            <Text
              style={[
                styles.modeTitle,
                mode === 'card' && styles.modeTitleActive,
              ]}
            >
              Credit card
            </Text>
            <Text style={styles.modeSub}>Add from your card</Text>
          </Pressable>
        </View>

        {mode === 'qr' ? (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Your payment QR</Text>
              <Text style={styles.phone}>{profile.phone}</Text>
              <PaymentQrCode
                phone={profile.phone}
                name={session?.name ?? profile.name}
                amount={qrRequestAmount}
              />
            </View>

            <Text style={styles.label}>Request amount (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Any amount"
              placeholderTextColor={colors.textSecondary}
              value={qrAmount}
              onChangeText={setQrAmount}
              keyboardType="decimal-pad"
            />
            <Text style={styles.note}>
              Leave blank for an open amount. When someone scans this QR in Send,
              they pay you instantly from their ZakaPay balance.
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
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

            <Text style={styles.label}>Card number</Text>
            <TextInput
              style={styles.input}
              placeholder="4242 4242 4242 4242"
              placeholderTextColor={colors.textSecondary}
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCardNumber(v))}
              keyboardType="number-pad"
              maxLength={19}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Expiry</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.textSecondary}
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor={colors.textSecondary}
                  value={cvv}
                  onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
            </View>

            <Text style={styles.note}>
              Demo mode — any valid-looking card adds money instantly. No real
              charge is made.
            </Text>

            <Pressable
              style={[styles.submitBtn, loading && styles.disabled]}
              onPress={handleCardDeposit}
              disabled={loading}
            >
              <IconLabel icon="credit-card" style={styles.submitText}>
                Add money to wallet
              </IconLabel>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { paddingHorizontal: 20, paddingTop: 18 },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    loadingText: { color: colors.textSecondary },
    heading: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 6,
    },
    subheading: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
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
    modeIcon: { marginBottom: 6 },
    modeTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '800',
    },
    modeTitleActive: { color: colors.text },
    modeSub: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
    },
    section: { marginTop: 4 },
    card: {
      backgroundColor: colors.surfaceSoft,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    cardLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 4,
    },
    phone: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 20,
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
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
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
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    half: { flex: 1 },
    note: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 14,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 24,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    disabled: { opacity: 0.7 },
    submitText: {
      color: '#06120D',
      fontSize: 16,
      fontWeight: '800',
    },
  });
}
