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
      <View style={styles.dotWrap}>
        {!notification.read && <View style={styles.dot} />}
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  unread: {
    borderColor: colors.borderGold,
    backgroundColor: colors.surfaceLight,
  },
  unreadStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.gold,
  },
  dotWrap: {
    width: 12,
    marginRight: 8,
    paddingTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  body: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
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
