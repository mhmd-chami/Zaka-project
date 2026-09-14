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
import { getLocationById, zakaLocations, ZakaLocation } from '@/data/locations';
import { getSession } from '@/services/authStorage';
import { sendCashAtLocation, sendMoneyP2P } from '@/services/walletStorage';
import { AuthSession, SendMode } from '@/types';

const QUICK = [5, 10, 20, 50];

export default function SendScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<SendMode>('p2p');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState<ZakaLocation>(zakaLocations[0]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  const isStaff = session?.role === 'admin' || session?.role === 'owner';
  const adminLocation = getLocationById(session?.locationId);

  useEffect(() => {
    getSession().then(setSession);
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
      'Sent instantly! 💸',
      `$${value.toFixed(2)} sent to ${phone.trim()} via ZakaPay.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
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
      'Request sent to branch 🏪',
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
      <ScrollView contentContainerStyle={styles.container}>
        {session?.role === 'admin' && adminLocation ? (
          <View style={styles.staffBanner}>
            <Text style={styles.staffBannerText}>
              🏪 Sending from {adminLocation.name} location wallet
            </Text>
          </View>
        ) : null}
        {session?.role === 'owner' ? (
          <View style={[styles.staffBanner, styles.ownerBanner]}>
            <Text style={styles.staffBannerText}>
              👑 Sending from owner wallet
            </Text>
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
          >
            <Text style={styles.modeEmoji}>💸</Text>
            <Text style={[styles.modeTitle, mode === 'p2p' && styles.modeTitleActive]}>
              ZakaPay → ZakaPay
            </Text>
            <Text style={styles.modeSub}>User to user · instant</Text>
          </Pressable>

          <Pressable
            style={[styles.modeBtn, mode === 'location' && styles.modeBtnActive]}
            onPress={() => setMode('location')}
          >
            <Text style={styles.modeEmoji}>🏪</Text>
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
            <TextInput
              style={styles.input}
              placeholder="+961 70 000 000"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
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
              >
                <Text style={styles.locationName}>{loc.name}</Text>
                <Text style={styles.locationAddr}>{loc.address}</Text>
                <Text style={styles.locationHours}>🕐 {loc.hours}</Text>
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
              style={styles.quickBtn}
              onPress={() => setAmount(String(q))}
            >
              <Text style={styles.quickText}>${q}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.sendBtn, loading && styles.disabled]}
          onPress={mode === 'p2p' || isStaff ? handleP2PSend : handleCashSend}
          disabled={loading}
        >
          <Text style={styles.sendText}>
            {mode === 'p2p' || isStaff
              ? '💸 Send to ZakaPay user'
              : '🏪 Send to branch'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
  staffBanner: {
    backgroundColor: colors.adminDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderGold,
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeBtnActive: {
    borderColor: colors.gold,
    backgroundColor: colors.surfaceLight,
  },
  modeEmoji: {
    fontSize: 24,
    marginBottom: 6,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.surfaceLight,
  },
  locationName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
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
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  quickText: {
    color: colors.goldLight,
    fontWeight: '700',
  },
  sendBtn: {
    backgroundColor: colors.primaryDark,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 28,
    borderWidth: 1.5,
    borderColor: colors.goldMuted,
  },
  disabled: { opacity: 0.7 },
  sendText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
