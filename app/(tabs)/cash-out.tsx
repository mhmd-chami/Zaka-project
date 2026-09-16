import * as Haptics from 'expo-haptics';
import { IconLabel } from '@/components/AppIcon';
import { useState } from 'react';
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
import { CameraQrScanner } from '@/components/CameraQrScanner';
import { contentBottomPadding } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { getLocationById } from '@/data/locations';
import { createCashOutRequest } from '@/services/cashOutStorage';
import { LocationQrData, parseLocationQrPayload } from '@/utils/locationQr';

const QUICK = [20, 50, 100, 200];

export default function CashOutScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useSettings();
  const styles = makeStyles(colors);
  const [scanned, setScanned] = useState(false);
  const [location, setLocation] = useState<LocationQrData | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  function resetScan() {
    setScanned(false);
    setLocation(null);
    setAmount('');
  }

  function handleBarcode({ data }: { data: string }) {
    if (scanned || location) return;
    const parsed = parseLocationQrPayload(data);
    if (!parsed) return;

    const known = getLocationById(parsed.locationId);
    setScanned(true);
    setLocation({
      locationId: parsed.locationId,
      name: known?.name ?? parsed.name,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleSubmit() {
    if (!location) return;

    const value = parseFloat(amount);
    if (!value || value <= 0) {
      Alert.alert('Invalid amount', 'Enter how much to cash out.');
      return;
    }

    setLoading(true);
    const result = await createCashOutRequest(
      location.locationId,
      location.name,
      value
    );
    setLoading(false);

    if (!result.ok) {
      Alert.alert('Cash out failed', result.error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Request sent',
      `$${value.toFixed(2)} cash out at ${location.name}.\n\nRef: ${result.reference}\n\nShow this reference to the agent. Your balance will update once they confirm.`,
      [{ text: 'Done', onPress: resetScan }]
    );
  }

  if (location) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.formContainer,
            { paddingBottom: contentBottomPadding(insets.bottom, 20) },
          ]}
        >
          <View style={styles.branchCard}>
            <IconLabel icon="store" style={styles.branchBadge}>Branch scanned</IconLabel>
            <Text style={styles.branchName}>{location.name}</Text>
            <Pressable onPress={resetScan}>
              <Text style={styles.rescan}>Scan a different QR</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Amount to cash out ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
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

          <Text style={styles.note}>
            The branch agent will verify your ID and hand you cash. Your wallet
            is debited when they accept the request.
          </Text>

          <Pressable
            style={[styles.submitBtn, loading && styles.disabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <IconLabel icon="banknote" style={styles.submitText}>Request cash out</IconLabel>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.flex}>
      <Text style={styles.subtitle}>
        Scan the branch QR at the counter to withdraw cash from your wallet.
      </Text>

      <CameraQrScanner
        hint="Scan the branch cash-out QR"
        scanned={scanned}
        onScan={(data) => handleBarcode({ data })}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      paddingHorizontal: 24,
      paddingTop: 12,
      marginBottom: 16,
      lineHeight: 20,
    },
    formContainer: { padding: 20 },
    branchCard: {
      backgroundColor: colors.surfaceSoft,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(42,140,137,0.28)',
      marginBottom: 24,
    },
    branchBadge: {
      color: colors.warning,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 6,
    },
    branchName: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
    },
    rescan: {
      color: colors.primaryLight,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 14,
    },
    label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surfaceSoft,
      borderRadius: 14,
      padding: 16,
      fontSize: 22,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      fontWeight: '700',
    },
    quickRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 14,
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
    note: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 20,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 28,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    disabled: { opacity: 0.7 },
    submitText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '800',
    },
  });
}
