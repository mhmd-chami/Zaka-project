import { AppIcon, type IconName } from '@/components/AppIcon';
import { StyleSheet, Text, View } from 'react-native';
import { radius, shadows } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';

interface Props {
  icon: IconName;
  label: string;
  value: string;
}

export function StatCard({ icon, label, value }: Props) {
  const { colors } = useSettings();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.card, shadows.soft]}>
      <View style={styles.icon}>
        <AppIcon name={icon} size={22} color={colors.primaryLight} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.surfaceSoft,
      borderRadius: radius.lg,
      padding: 14,
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: '45%',
    },
    icon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    value: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    label: {
      color: colors.textSecondary,
      fontSize: 10,
      marginTop: 4,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
  });
}
