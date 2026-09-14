import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@/constants/theme';
import { formatCoords, mapsLink } from '@/services/routeService';
import { Coordinates } from '@/types';

interface Props {
  visible: boolean;
  location: Coordinates;
  onDismiss: () => void;
  onConfirmSOS: () => void;
}

export function SOSModal({ visible, location, onDismiss, onConfirmSOS }: Props) {
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [visible]);

  async function sendSOS() {
    onConfirmSOS();
    const message =
      `🚨 SOS — SafeRoute Alert!\n\n` +
      `I need help. My location:\n${formatCoords(location)}\n` +
      `${mapsLink(location)}\n\n` +
      `Sent via SafeRoute — Zaka Project`;

    await Share.share({ message, title: 'SOS Alert' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>🚨</Text>
          <Text style={styles.title}>Emergency SOS</Text>
          <Text style={styles.sub}>
            Shake detected or SOS pressed. Send your live location to trusted
            contacts now.
          </Text>

          <Pressable style={styles.sosBtn} onPress={sendSOS}>
            <Text style={styles.sosText}>Send SOS + Location</Text>
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={onDismiss}>
            <Text style={styles.cancelText}>I'm OK — Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.danger,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.danger,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  sosBtn: {
    backgroundColor: colors.dangerDark,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  sosText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    padding: 12,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});
