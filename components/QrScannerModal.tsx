import { useState } from 'react';
import { AppIcon } from '@/components/AppIcon';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraQrScanner } from '@/components/CameraQrScanner';
import { useSettings } from '@/contexts/SettingsContext';
import { parsePaymentQrPayload } from '@/utils/paymentQr';

interface Props {
  visible: boolean;
  onClose: () => void;
  onScan: (data: { phone: string; name?: string; amount?: number }) => void;
}

export function QrScannerModal({ visible, onClose, onScan }: Props) {
  const { colors } = useSettings();
  const styles = makeStyles(colors);
  const [scanned, setScanned] = useState(false);

  function handleClose() {
    setScanned(false);
    onClose();
  }

  function handleScan(data: string) {
    if (scanned) return;
    const parsed = parsePaymentQrPayload(data);
    if (!parsed?.phone) return;

    setScanned(true);
    onScan(parsed);
    handleClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan ZakaPay QR</Text>
          <Pressable
            onPress={handleClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
          >
            <AppIcon name="close" size={22} color={colors.goldLight} />
          </Pressable>
        </View>

        <CameraQrScanner
          active={visible}
          requireScreenFocus={false}
          hint="Point at a ZakaPay payment QR"
          scanned={scanned}
          onScan={handleScan}
        />
      </View>
    </Modal>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 16,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
    },
  });
}
