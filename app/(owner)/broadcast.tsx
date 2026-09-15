import { IconLabel } from '@/components/AppIcon';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '@/constants/theme';
import { broadcastNotification } from '@/services/notificationStorage';

type Target = 'users' | 'admins';

export default function OwnerNotifyScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<Target>('users');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Missing info', 'Enter title and message.');
      return;
    }

    setLoading(true);
    const count = await broadcastNotification(
      title.trim(),
      message.trim(),
      'owner',
      target === 'admins' ? 'admin' : 'user'
    );
    setLoading(false);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Broadcast sent!', `Delivered to ${count} accounts.`);
    setTitle('');
    setMessage('');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Send to</Text>
      <View style={styles.targetRow}>
        <Pressable
          style={[styles.targetBtn, target === 'users' && styles.targetActive]}
          onPress={() => setTarget('users')}
        >
          <IconLabel
            icon="users"
            style={[
              styles.targetText,
              target === 'users' && styles.targetTextActive,
            ]}
          >
            All users
          </IconLabel>
        </Pressable>
        <Pressable
          style={[styles.targetBtn, target === 'admins' && styles.targetActive]}
          onPress={() => setTarget('admins')}
        >
          <IconLabel
            icon="shield"
            style={[
              styles.targetText,
              target === 'admins' && styles.targetTextActive,
            ]}
          >
            All admins
          </IconLabel>
        </Pressable>
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="System announcement"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write broadcast message..."
        placeholderTextColor={colors.textSecondary}
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Pressable
        style={[styles.btn, loading && styles.disabled]}
        onPress={handleSend}
        disabled={loading}
      >
        <IconLabel icon="crown" style={styles.btnText}>Broadcast notification</IconLabel>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  label: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  targetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  targetBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  targetActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceLight,
  },
  targetText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  targetTextActive: {
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  btn: {
    backgroundColor: colors.accent,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  disabled: { opacity: 0.7 },
  btnText: {
    color: '#0B1220',
    fontSize: 16,
    fontWeight: '800',
  },
});
