import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '@/constants/theme';

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
    backgroundColor: colors.primaryDark,
    paddingVertical: 17,
    paddingHorizontal: 24,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.goldMuted,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gold: {
    backgroundColor: colors.goldMuted,
    borderColor: colors.goldLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.borderGold,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  goldText: {
    color: colors.background,
  },
  outlineText: {
    color: colors.goldLight,
  },
});
