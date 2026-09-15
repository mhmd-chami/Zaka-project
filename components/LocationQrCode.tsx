import QRCode from 'react-native-qrcode-svg';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { buildLocationQrPayload } from '@/utils/locationQr';

interface Props {
  locationId: string;
  name: string;
  size?: number;
}

export function LocationQrCode({ locationId, name, size = 180 }: Props) {
  const payload = buildLocationQrPayload(locationId, name);

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
      <Text style={styles.hint}>Customers scan this to cash out at your branch</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  qrBox: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 17,
    paddingHorizontal: 8,
  },
});
