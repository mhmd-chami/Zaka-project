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
import { colors } from '@/constants/theme';
import { carriers } from '@/data/carriers';
import { getProfile, topUpPhone } from '@/services/walletStorage';
import { Carrier } from '@/types';

const QUICK = [5, 10, 15, 25];

export default function TopUpScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('10');
  const [carrier, setCarrier] = useState<Carrier>(carriers[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then((p) => setPhone(p.phone));
  }, []);

  async function handleTopUp() {
    const value = parseFloat(amount);
    if (!phone.trim()) {
      Alert.alert('Missing number', 'Enter the phone number to charge.');
      return;
    }
    if (!value || value < carrier.minAmount || value > carrier.maxAmount) {
      Alert.alert(
        'Invalid amount',
        `Enter between $${carrier.minAmount} and $${carrier.maxAmount}.`
      );
      return;
    }

    setLoading(true);
    const result = await topUpPhone(carrier.name, phone.trim(), value);
    setLoading(false);

    if (!result.ok) {
      Alert.alert('Top-up failed', result.error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Number charged! 📱',
      `$${value.toFixed(2)} added to ${phone.trim()} via ${carrier.name}.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>
          Charge your mobile number in dollars — Alfa, Touch, MTN.
        </Text>

        <Text style={styles.label}>Carrier</Text>
        <View style={styles.carrierRow}>
          {carriers.map((c) => (
            <Pressable
              key={c.id}
              style={[
                styles.carrierBtn,
                carrier.id === c.id && styles.carrierSelected,
              ]}
              onPress={() => setCarrier(c)}
            >
              <Text style={styles.carrierEmoji}>{c.emoji}</Text>
              <Text
                style={[
                  styles.carrierName,
                  carrier.id === c.id && styles.carrierNameSelected,
                ]}
              >
                {c.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Phone number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+961 70 000 000"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Amount ($)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="10.00"
          placeholderTextColor={colors.textSecondary}
        />

        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <Pressable
              key={q}
              style={styles.quickBtn}
              onPress={() => setAmount(String(q))}
            >
              <Text style={styles.quickText}>${q}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.topUpBtn, loading && styles.disabled]}
          onPress={handleTopUp}
          disabled={loading}
        >
          <Text style={styles.topUpText}>
            📱 Charge {carrier.name} — ${amount || '0'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  carrierRow: {
    flexDirection: 'row',
    gap: 10,
  },
  carrierBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  carrierSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  carrierEmoji: { fontSize: 24, marginBottom: 4 },
  carrierName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  carrierNameSelected: { color: colors.text },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
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
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  quickText: {
    color: colors.warning,
    fontWeight: '700',
  },
  topUpBtn: {
    backgroundColor: colors.primaryDark,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  disabled: { opacity: 0.7 },
  topUpText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
