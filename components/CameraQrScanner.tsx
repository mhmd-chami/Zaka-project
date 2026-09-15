import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  hint: string;
  onScan: (data: string) => void;
  scanned?: boolean;
  /** When false, unmounts the camera (e.g. modal closed). Defaults to true. */
  active?: boolean;
  /** Set false for modals so the camera does not wait on tab focus. */
  requireScreenFocus?: boolean;
}

export function CameraQrScanner({
  hint,
  onScan,
  scanned = false,
  active = true,
  requireScreenFocus = true,
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [granted, setGranted] = useState(false);
  const [focused, setFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  const cameraActive = active && (!requireScreenFocus || focused);

  useEffect(() => {
    if (permission?.granted) {
      setGranted(true);
    }
  }, [permission?.granted]);

  const allowCamera = useCallback(async () => {
    const result = await requestPermission();
    setGranted(result.granted);
  }, [requestPermission]);

  const height = Math.max(320, Dimensions.get('window').height * 0.52);

  if (!permission) {
    return (
      <View style={[styles.center, { minHeight: height }]}>
        <Text style={styles.message}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!granted && !permission.granted) {
    return (
      <View style={[styles.center, { minHeight: height }]}>
        <Text style={styles.message}>
          Camera access is needed to scan QR codes.
        </Text>
        {permission.canAskAgain ? (
          <Pressable style={styles.btn} onPress={allowCamera}>
            <Text style={styles.btnText}>Allow camera</Text>
          </Pressable>
        ) : (
          <>
            <Text style={[styles.message, styles.denied]}>
              Camera access is blocked. Enable it in your phone settings.
            </Text>
            <Pressable
              style={styles.btn}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.btnText}>Open Settings</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.cameraWrap, { height }]}>
      {cameraActive ? (
        <CameraView
          key="qr-scanner"
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={
            scanned ? undefined : ({ data }) => onScan(data)
          }
        />
      ) : (
        <View style={styles.camera} />
      )}
      <View style={styles.frame} pointerEvents="none" />
      <Text style={styles.scanHint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  denied: {
    marginBottom: 12,
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
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderGold,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  frame: {
    position: 'absolute',
    top: '22%',
    left: '12%',
    right: '12%',
    bottom: '30%',
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 16,
  },
  scanHint: {
    position: 'absolute',
    bottom: 28,
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
