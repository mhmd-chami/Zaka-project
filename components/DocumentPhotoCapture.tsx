import { CameraView, useCameraPermissions, type CameraView as CameraViewType } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Image, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '@/components/AppIcon';
import { useSettings } from '@/contexts/SettingsContext';
import { IdentityDocumentType } from '@/types';

interface Props {
  visible: boolean;
  documentType: IdentityDocumentType;
  onClose: () => void;
  onCaptured: (photo: { uri: string; base64: string }) => void;
}

const labels: Record<IdentityDocumentType, { title: string; hint: string }> = {
  lebanese_id: {
    title: 'Capture Lebanese ID',
    hint: 'Place the front of your ID inside the frame. Use good lighting and avoid glare.',
  },
  passport: {
    title: 'Capture passport',
    hint: 'Open your passport to the photo page and fit it inside the frame.',
  },
  residence_permit: {
    title: 'Capture residence permit',
    hint: 'Place the front of your permit inside the frame.',
  },
};

export function DocumentPhotoCapture({ visible, documentType, onClose, onCaptured }: Props) {
  const { colors, t } = useSettings();
  const styles = makeStyles(colors);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string>();
  const [photoBase64, setPhotoBase64] = useState<string>();
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<CameraViewType>(null);
  const copy = labels[documentType];

  useEffect(() => {
    if (visible) {
      setPhotoUri(undefined);
      setPhotoBase64(undefined);
      if (!permission?.granted) requestPermission();
    }
  }, [permission?.granted, requestPermission, visible]);

  async function capturePhoto() {
    if (capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 1,
        base64: true,
        skipProcessing: false,
      });
      if (photo?.uri && photo.base64) {
        setPhotoUri(photo.uri);
        setPhotoBase64(photo.base64);
      }
    } finally {
      setCapturing(false);
    }
  }

  function confirmPhoto() {
    if (!photoUri || !photoBase64) return;
    onCaptured({ uri: photoUri, base64: photoBase64 });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{copy.title}</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('cancel')}>
            <AppIcon name="close" size={22} color={colors.goldLight} />
          </Pressable>
        </View>

        {!permission ? (
          <Text style={styles.message}>{t('verifyCameraChecking')}</Text>
        ) : !permission.granted ? (
          <View style={styles.center}>
            <Text style={styles.message}>{t('verifyCameraNeeded')}</Text>
            {permission.canAskAgain ? (
              <Pressable style={styles.button} onPress={requestPermission}>
                <Text style={styles.buttonText}>{t('verifyAllowCamera')}</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.button} onPress={() => Linking.openSettings()}>
                <Text style={styles.buttonText}>{t('verifyOpenSettings')}</Text>
              </Pressable>
            )}
          </View>
        ) : photoUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
            <Text style={styles.hint}>{t('verifyPhotoReview')}</Text>
            <View style={styles.actions}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setPhotoUri(undefined);
                  setPhotoBase64(undefined);
                }}
              >
                <Text style={styles.secondaryText}>{t('verifyRetake')}</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={confirmPhoto}>
                <Text style={styles.buttonText}>{t('verifyUsePhoto')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.cameraWrap}>
              <CameraView ref={cameraRef} style={styles.camera} facing="back" />
              <View style={styles.frame} pointerEvents="none" />
            </View>
            <Text style={styles.hint}>{copy.hint}</Text>
            <View style={styles.actions}>
              <Pressable style={styles.button} onPress={capturePhoto} disabled={capturing}>
                <AppIcon name="scan" size={18} color="#FFF" />
                <Text style={styles.buttonText}>
                  {capturing ? t('verifyCapturing') : t('verifyCaptureDocument')}
                </Text>
              </Pressable>
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
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 16,
      paddingHorizontal: 20,
      paddingTop: 56,
    },
    title: { color: colors.text, fontSize: 18, fontWeight: '800' },
    center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
    message: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center', padding: 24 },
    cameraWrap: {
      backgroundColor: '#000',
      height: 440,
      marginHorizontal: 20,
      overflow: 'hidden',
      position: 'relative',
    },
    camera: { flex: 1 },
    frame: {
      borderColor: colors.gold,
      borderRadius: 16,
      borderWidth: 2,
      bottom: '18%',
      left: '8%',
      position: 'absolute',
      right: '8%',
      top: '18%',
    },
    previewWrap: { flex: 1, paddingHorizontal: 20 },
    preview: {
      backgroundColor: '#000',
      borderRadius: 16,
      height: 440,
      width: '100%',
    },
    hint: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
      paddingHorizontal: 28,
      paddingTop: 18,
      textAlign: 'center',
    },
    actions: { alignItems: 'center', gap: 12, padding: 24 },
    button: {
      alignItems: 'center',
      backgroundColor: colors.primaryDark,
      borderColor: colors.goldMuted,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
      minWidth: 220,
      paddingHorizontal: 22,
      paddingVertical: 14,
    },
    buttonText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    secondaryButton: { padding: 10 },
    secondaryText: { color: colors.primaryLight, fontSize: 14, fontWeight: '700' },
  });
}
