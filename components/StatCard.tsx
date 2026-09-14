import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  emoji: string;
  label: string;
  value: string;
}

export function StatCard({ emoji, label, value }: Props) {
  return (
    <View style={styles.card}>
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '45%',
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  value: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
