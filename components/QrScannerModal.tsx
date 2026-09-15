import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@/constants/theme';
import { parsePaymentQrPayload } from '@/utils/paymentQr';

interface Props {
  visible: boolean;
  onClose: () => void;
  onScan: (data: { phone: string; name?: string; amount?: number }) => void;
}

export function QrScannerModal({ visible, onClose, onScan }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  function handleClose() {
    setScanned(false);
    onClose();
  }

  function handleBarcode({ data }: { data: string }) {
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
          <Pressable onPress={handleClose} hitSlop={12}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        {!permission?.granted ? (
          <View style={styles.center}>
            <Text style={styles.message}>
              Camera access is needed to scan payment QR codes.
            </Text>
            <Pressable style={styles.btn} onPress={requestPermission}>
              <Text style={styles.btnText}>Allow camera</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned ? undefined : handleBarcode}
            />
            <View style={styles.frame} pointerEvents="none" />
            <Text style={styles.scanHint}>Point at a ZakaPay payment QR</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  close: {
    color: colors.goldLight,
    fontSize: 22,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.goldMuted,
  },
  btnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  cameraWrap: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  camera: {
    flex: 1,
  },
  frame: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '15%',
    bottom: '35%',
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 16,
  },
  scanHint: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
