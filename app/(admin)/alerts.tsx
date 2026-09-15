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
import { getSession } from '@/services/authStorage';
import { broadcastNotification } from '@/services/notificationStorage';

export default function AdminNotifyScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Missing info', 'Enter title and message.');
      return;
    }

    setLoading(true);
    const session = await getSession();
    const count = await broadcastNotification(
      title.trim(),
      message.trim(),
      session?.role ?? 'admin'
    );
    setLoading(false);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Sent!', `Notification sent to ${count} users.`);
    setTitle('');
    setMessage('');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.info}>
        Send a push-style alert to all ZakaPay users.
      </Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. New shop items!"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your message..."
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
        <IconLabel icon="megaphone" style={styles.btnText}>Send to all users</IconLabel>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  info: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
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
    backgroundColor: colors.warning,
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
