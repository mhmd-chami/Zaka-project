import { AppIcon, type IconName } from '@/components/AppIcon';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows } from '@/constants/theme';

interface Props {
  icon: IconName;
  label: string;
  value: string;
}

export function StatCard({ icon, label, value }: Props) {
  return (
    <View style={[styles.card, shadows.soft]}>
      <View style={styles.icon}>
        <AppIcon name={icon} size={25} color={colors.primaryLight} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '45%',
  },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  value: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
