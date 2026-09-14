import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';

interface Props {
  emoji: string;
  label: string;
  value: string;
}

export function StatCard({ emoji, label, value }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topLine} />
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '45%',
    overflow: 'hidden',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.goldMuted,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
    marginTop: 4,
  },
  value: {
    color: colors.goldLight,
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
