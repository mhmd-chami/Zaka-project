import { AppIcon, type IconName } from '@/components/AppIcon';
import { colors } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  icon: IconName;
  label: string;
  hint?: string;
  tint: string;
  badge?: number;
  onPress: () => void;
}

export function DashboardTile({ icon, label, hint, tint, badge, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.tile, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: tint }]}>
          <AppIcon name={icon} size={20} color={colors.text} />
        </View>
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  pressed: { opacity: 0.75 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.danger,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  label: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 12, letterSpacing: -0.2 },
  hint: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
});