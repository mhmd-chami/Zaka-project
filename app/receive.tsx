import { IconLabel } from '@/components/AppIcon';
import { MoneyActionIcon } from '@/components/MoneyActionIcon';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LocationQrCode } from '@/components/LocationQrCode';
import { PaymentQrCode } from '@/components/PaymentQrCode';
import { useSettings } from '@/contexts/SettingsContext';
import { getLocationById } from '@/data/locations';
import { getSession } from '@/services/authStorage';
import { getProfile, receiveMoney } from '@/services/walletStorage';
import { AuthSession, WalletProfile } from '@/types';

export default function ReceiveScreen() {
  const { colors } = useSettings();
  const styles = makeStyles(colors);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [demoAmount, setDemoAmount] = useState('25');
  const [qrAmount, setQrAmount] = useState('');

  useEffect(() => {
    (async () => {
      setSession(await getSession());
      setProfile(await getProfile());
    })();
  }, []);

  const location = getLocationById(session?.locationId);
  const isAdmin = session?.role === 'admin';
  const isOwner = session?.role === 'owner';

  async function shareNumber() {
    if (!profile) return;

    let message = '';
    if (isAdmin && location) {
      message =
        `Send money to ${location.name}\n\n` +
        `ZakaPay Location Agent\n` +
        `Address: ${location.address}\n` +
        `Phone: ${profile.phone}\n` +
        `Hours: ${location.hours}\n\n` +
        `Pay in app or bring cash to this location.`;
    } else {
      message =
        `Send me money on ZakaPay\n\n` +
        `My number: ${profile.phone}\n\n` +
        `Download ZakaPay to pay instantly.`;
    }

    await Share.share({
      title: isAdmin ? location?.name : 'Send me money on ZakaPay',
      message,
    });
  }

  async function simulateReceive() {
    const amount = parseFloat(demoAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid amount.');
      return;
    }

    const fromLabel = isAdmin
      ? 'Customer (cash)'
      : isOwner
        ? 'Business payment'
        : 'Friend';

    await receiveMoney(fromLabel, amount);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfile(await getProfile());
    Alert.alert('Received!', `$${amount.toFixed(2)} added to your wallet.`);
  }

  if (!profile) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, isAdmin && styles.cardAdmin]}>
        {isAdmin && location ? (
          <>
            <IconLabel icon="store" style={styles.locationBadge}>ZakaPay Location</IconLabel>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.locationAddr}>{location.address}</Text>
          </>
        ) : (
          <>
            <MoneyActionIcon action="receive" size={54} />
            <Text style={styles.cardTitle}>
              {isOwner ? 'Owner wallet number' : 'Your payment number'}
            </Text>
          </>
        )}
        <Text style={styles.phone}>{profile.phone}</Text>
        <Text style={styles.hint}>
          {isAdmin
            ? 'Customers can send ZakaPay or pay cash at your counter'
            : 'Share this number so others can send you money'}
        </Text>
      </View>

      {isAdmin && location ? (
        <View style={[styles.qrSection, styles.cashOutQrSection]}>
          <Text style={styles.qrTitle}>Cash out QR</Text>
          <LocationQrCode locationId={location.id} name={location.name} />
        </View>
      ) : null}

      <View style={styles.qrSection}>
        <Text style={styles.qrTitle}>
          {isAdmin ? 'Receive payment QR' : 'Scan to pay me'}
        </Text>
        <PaymentQrCode
          phone={profile.phone}
          name={session?.name ?? profile.name}
          amount={
            parseFloat(qrAmount) > 0 ? parseFloat(qrAmount) : undefined
          }
        />
        {!isAdmin ? (
          <TextInput
            style={styles.qrAmountInput}
            value={qrAmount}
            onChangeText={setQrAmount}
            keyboardType="decimal-pad"
            placeholder="Fixed amount (optional)"
            placeholderTextColor={colors.textSecondary}
          />
        ) : null}
      </View>

      <Pressable style={styles.shareBtn} onPress={shareNumber}>
        <IconLabel icon="share" style={styles.shareText}>
          {isAdmin ? 'Share location details' : 'Share my number'}
        </IconLabel>
      </Pressable>

      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>
          {isAdmin
            ? 'Demo: customer paid at location'
            : 'Demo: simulate receiving money'}
        </Text>
        <TextInput
          style={styles.input}
          value={demoAmount}
          onChangeText={setDemoAmount}
          keyboardType="decimal-pad"
          placeholder="Amount"
          placeholderTextColor={colors.textSecondary}
        />
        <Pressable style={styles.demoBtn} onPress={simulateReceive}>
          <IconLabel icon="receive" style={styles.demoBtnText}>
            Receive ${demoAmount || '0'}
          </IconLabel>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 44,
    },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    loadingText: { color: colors.textSecondary },
    card: {
      backgroundColor: colors.surfaceSoft,
      borderRadius: 18,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    cardAdmin: {
      borderColor: colors.warning,
    },
    locationBadge: {
      color: colors.warning,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 6,
    },
    locationName: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },
    locationAddr: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 4,
      marginBottom: 12,
      textAlign: 'center',
    },
    cardTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 12,
    },
    phone: {
      color: colors.text,
      fontSize: 27,
      fontWeight: '800',
      marginTop: 8,
    },
    hint: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 18,
    },
    qrSection: {
      marginTop: 20,
      backgroundColor: colors.surfaceSoft,
      borderRadius: 18,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cashOutQrSection: {
      borderColor: colors.warning,
    },
    qrTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 16,
      letterSpacing: -0.15,
    },
    qrAmountInput: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: 14,
      padding: 12,
      fontSize: 15,
      color: colors.text,
      marginTop: 14,
      width: '100%',
      textAlign: 'center',
    },
    shareBtn: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    shareText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '800',
    },
    demoBox: {
      marginTop: 32,
      padding: 16,
      backgroundColor: colors.surfaceSoft,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    demoTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 12,
    },
    input: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: 14,
      padding: 14,
      fontSize: 18,
      color: colors.text,
      marginBottom: 12,
    },
    demoBtn: {
      backgroundColor: colors.accent,
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    demoBtnText: {
      color: colors.background,
      fontWeight: '800',
      fontSize: 15,
    },
  });
}
