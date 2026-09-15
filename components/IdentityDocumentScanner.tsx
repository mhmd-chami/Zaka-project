import { CameraView, useCameraPermissions, type CameraView as CameraViewType } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '@/components/AppIcon';
import { useSettings } from '@/contexts/SettingsContext';

interface IdentityScanResult {
  rawData?: string;
  documentNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  nationality?: string;
  photoUri?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onScan: (result: IdentityScanResult) => void;
}

function parseBarcodeData(data: string): IdentityScanResult {
  try {
    const parsed = JSON.parse(data) as Record<string, unknown>;
    return {
      rawData: data,
      documentNumber: String(parsed.documentNumber ?? parsed.idNumber ?? parsed.number ?? ''),
      fullName: String(parsed.fullName ?? parsed.name ?? ''),
      dateOfBirth: String(parsed.dateOfBirth ?? parsed.dob ?? ''),
      expiryDate: String(parsed.expiryDate ?? parsed.expiry ?? ''),
      nationality: String(parsed.nationality ?? ''),
    };
  } catch {
    return { rawData: data, documentNumber: data.trim() };
  }
}

export function IdentityDocumentScanner({ visible, onClose, onScan }: Props) {
  const { colors } = useSettings();
  const styles = makeStyles(colors);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [photoUri, setPhotoUri] = useState<string>();
  const cameraRef = useRef<CameraViewType>(null);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setPhotoUri(undefined);
      if (!permission?.granted) requestPermission();
    }
  }, [permission?.granted, requestPermission, visible]);

  async function capturePhoto() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) setPhotoUri(photo.uri);
  }

  function handleBarcodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    onScan({ ...parseBarcodeData(data), photoUri });
    onClose();
  }

  function finishPhotoCapture() {
    if (!photoUri) return;
    onScan({ photoUri });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan identity document</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close scanner">
            <AppIcon name="close" size={22} color={colors.goldLight} />
          </Pressable>
        </View>

        {!permission ? (
          <Text style={styles.message}>Checking camera permission...</Text>
        ) : !permission.granted ? (
          <View style={styles.center}>
            <Text style={styles.message}>Camera access is needed to scan your document.</Text>
            {permission.canAskAgain ? (
              <Pressable style={styles.button} onPress={requestPermission}>
                <Text style={styles.buttonText}>Allow camera</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.button} onPress={() => Linking.openSettings()}>
                <Text style={styles.buttonText}>Open settings</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <>
            <View style={styles.cameraWrap}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['pdf417', 'qr', 'code128', 'code39', 'aztec', 'datamatrix'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />
              <View style={styles.frame} pointerEvents="none" />
            </View>
            <Text style={styles.hint}>
              Align the barcode or QR code inside the frame. You can also capture the document for manual review.
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.button} onPress={capturePhoto}>
                <AppIcon name="scan" size={18} color="#FFF" />
                <Text style={styles.buttonText}>Capture document</Text>
              </Pressable>
              {photoUri && (
                <Pressable style={styles.secondaryButton} onPress={finishPhotoCapture}>
                  <Text style={styles.secondaryText}>Use captured document</Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    container: { backgroundColor: colors.background, flex: 1 },
    header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16, paddingHorizontal: 20, paddingTop: 56 },
    title: { color: colors.text, fontSize: 18, fontWeight: '800' },
    center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
    message: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center' },
    cameraWrap: { backgroundColor: '#000', height: 440, marginHorizontal: 20, overflow: 'hidden', position: 'relative' },
    camera: { flex: 1 },
    frame: { borderColor: colors.gold, borderRadius: 16, borderWidth: 2, bottom: '25%', left: '8%', position: 'absolute', right: '8%', top: '25%' },
    hint: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, paddingHorizontal: 28, paddingTop: 18, textAlign: 'center' },
    actions: { alignItems: 'center', gap: 12, padding: 24 },
    button: { alignItems: 'center', backgroundColor: colors.primaryDark, borderColor: colors.goldMuted, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 14 },
    buttonText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    secondaryButton: { padding: 10 },
    secondaryText: { color: colors.primaryLight, fontSize: 14, fontWeight: '700' },
  });
}