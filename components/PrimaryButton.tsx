import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '@/constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'gold' | 'outline';
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
  style,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && shadows.glow,
        variant === 'gold' && styles.gold,
        variant === 'outline' && styles.outline,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          variant === 'outline' && styles.outlineText,
          variant === 'gold' && styles.goldText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 56,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gold: {
    backgroundColor: colors.gold,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  outline: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderStrong,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    color: '#06130D',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  goldText: {
    color: colors.background,
  },
  outlineText: {
    color: colors.text,
  },
});
