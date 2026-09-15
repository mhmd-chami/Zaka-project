import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ShopItemCard } from '@/components/ShopItemCard';
import { colors } from '@/constants/theme';
import { carriers } from '@/data/carriers';
import { shopItems } from '@/data/shopItems';
import { getProfile, purchaseItem, topUpPhone } from '@/services/walletStorage';
import { Carrier } from '@/types';

const QUICK = [5, 10, 15, 25];

export default function ShopScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('10');
  const [carrier, setCarrier] = useState<Carrier>(carriers[0]);
  const [rechargeLoading, setRechargeLoading] = useState(false);

  useEffect(() => {
    getProfile().then((p) => setPhone(p.phone));
  }, []);

  async function buy(name: string, price: number) {
    const profile = await getProfile();

    Alert.alert('Confirm purchase', `Buy ${name} for $${price.toFixed(2)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Buy now',
        onPress: async () => {
          const result = await purchaseItem(name, price);
          if (!result.ok) {
            Alert.alert('Purchase failed', result.error);
            return;
          }
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          Alert.alert(
            'Success! 🎉',
            `${name} purchased.\nNew balance: $${(profile.balance - price).toFixed(2)}`
          );
          router.push('/(tabs)/history');
        },
      },
    ]);
  }

  async function handleRecharge() {
    const value = parseFloat(amount);
    if (!phone.trim()) {
      Alert.alert('Missing number', 'Enter the phone number to recharge.');
      return;
    }
    if (!value || value < carrier.minAmount || value > carrier.maxAmount) {
      Alert.alert(
        'Invalid amount',
        `Enter between $${carrier.minAmount} and $${carrier.maxAmount}.`
      );
      return;
    }

    setRechargeLoading(true);
    const result = await topUpPhone(carrier.name, phone.trim(), value);
    setRechargeLoading(false);

    if (!result.ok) {
      Alert.alert('Purchase failed', result.error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      `${carrier.name} recharge purchased! 📱`,
      `Redeem code: ${result.redeemCode}\n\nYour code was also sent to Notifications.`,
      [
        { text: 'View notifications', onPress: () => router.push('/notifications') },
        { text: 'OK' },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Mobile recharge</Text>
      <Text style={styles.sectionSub}>
        Buy Alfa, Touch, or MTN credit. Your redeem code arrives in
        Notifications.
      </Text>

      <View style={styles.rechargeBox}>
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
          style={[styles.rechargeBtn, rechargeLoading && styles.disabled]}
          onPress={handleRecharge}
          disabled={rechargeLoading}
        >
          <Text style={styles.rechargeBtnText}>
            📱 Buy {carrier.name} — ${amount || '0'}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
        Gift cards & more
      </Text>
      <Text style={styles.sectionSub}>
        Subscriptions, vouchers, and more with your balance.
      </Text>

      <View style={styles.grid}>
        {shopItems.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            onPress={() => buy(item.name, item.price)}
          />
        ))}
      </View>
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
    paddingBottom: 40,
  },
  sectionTitle: {
    color: colors.goldLight,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionTitleSpaced: {
    marginTop: 28,
  },
  sectionSub: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  rechargeBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  carrierRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  carrierBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  carrierSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  carrierEmoji: { fontSize: 22, marginBottom: 4 },
  carrierName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  carrierNameSelected: { color: colors.text },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 14,
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
    backgroundColor: colors.surfaceLight,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  quickText: {
    color: colors.warning,
    fontWeight: '700',
  },
  rechargeBtn: {
    backgroundColor: colors.primaryDark,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: colors.goldMuted,
  },
  rechargeBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  disabled: { opacity: 0.7 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
