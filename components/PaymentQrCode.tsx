import QRCode from 'react-native-qrcode-svg';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { buildPaymentQrPayload } from '@/utils/paymentQr';

interface Props {
  phone: string;
  name: string;
  amount?: number;
  size?: number;
}

export function PaymentQrCode({ phone, name, amount, size = 200 }: Props) {
  const payload = buildPaymentQrPayload(phone, name, amount);

  return (
    <View style={styles.wrap}>
      <View style={styles.qrBox}>
        <QRCode
          value={payload}
          size={size}
          color="#0B1220"
          backgroundColor="#FFFFFF"
        />
      </View>
      <Text style={styles.hint}>
        {amount && amount > 0
          ? `Requesting $${amount.toFixed(2)} · Scan to pay`
          : 'Scan with ZakaPay Send to pay you'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  qrBox: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
});
