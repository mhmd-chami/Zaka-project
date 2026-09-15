import { AppIcon } from '@/components/AppIcon';
import { withoutEmoji } from '@/utils/displayText';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { roleLabel } from '@/services/authStorage';
import { AppNotification } from '@/types';

interface Props {
  notification: AppNotification;
  onPress: () => void;
}

export function NotificationRow({ notification, onPress }: Props) {
  return (
    <Pressable
      style={[styles.row, !notification.read && styles.unread]}
      onPress={onPress}
    >
      {!notification.read ? <View style={styles.unreadStripe} /> : null}
      <View style={styles.iconWrap}>
        <AppIcon name="bell" size={21} color={notification.read ? colors.textMuted : colors.primaryLight} />
        {!notification.read && <View style={styles.dot} />}
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{withoutEmoji(notification.title)}</Text>
        <Text style={styles.message}>{withoutEmoji(notification.message)}</Text>
        <Text style={styles.meta}>
          From {roleLabel(notification.fromRole)} ·{' '}
          {new Date(notification.createdAt).toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  unread: {
    borderColor: 'rgba(40,199,128,0.28)',
    backgroundColor: colors.surfaceLight,
  },
  unreadStripe: { position: 'absolute', left: 0, top: 14, bottom: 14, width: 3, borderRadius: 3, backgroundColor: colors.primary },
  iconWrap: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.backgroundAlt, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  body: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
});
