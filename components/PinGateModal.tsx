import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
}

export function PinGateModal({ visible, onClose, onSubmit }: Props) {
  const [pin, setPin] = useState('');

  function handleClose() {
    setPin('');
    onClose();
  }

  function handleConfirm() {
    onSubmit(pin);
    setPin('');
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Enter transaction PIN</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholder="••••"
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
          <View style={styles.row}>
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.okBtn, pin.length < 4 && styles.disabled]}
              onPress={handleConfirm}
              disabled={pin.length < 4}
            >
              <Text style={styles.okText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  row: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: { color: colors.textSecondary, fontWeight: '700' },
  okBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
  },
  okText: { color: '#FFF', fontWeight: '800' },
  disabled: { opacity: 0.5 },
});
