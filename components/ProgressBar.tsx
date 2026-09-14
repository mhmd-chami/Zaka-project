import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  packed: number;
  total: number;
  percent: number;
}

export function ProgressBar({ packed, total, percent }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Packing progress</Text>
        <Text style={styles.count}>
          {packed}/{total} ({percent}%)
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      {percent === 100 && (
        <Text style={styles.complete}>🎉 All packed! You're ready to go!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  count: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  track: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  complete: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    textAlign: 'center',
  },
});
