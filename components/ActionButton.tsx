import { MoneyActionIcon, type MoneyAction } from '@/components/MoneyActionIcon';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows } from '@/constants/theme';

interface Props {
  icon: MoneyAction;
  label: string;
  onPress: () => void;
}

export function ActionButton({ icon, label, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, shadows.soft, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MoneyActionIcon action={icon} />
      <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    minHeight: 96,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.975 }],
    borderColor: colors.primary,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 10,
    textAlign: 'center',
  },
});
