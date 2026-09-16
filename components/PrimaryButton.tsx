import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { radius, shadows } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';

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
  const { colors } = useSettings();
  const styles = makeStyles(colors);

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

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    btn: {
      minHeight: 50,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)',
    },
    gold: {
      backgroundColor: colors.gold,
      borderColor: 'rgba(255,255,255,0.10)',
    },
    outline: {
      backgroundColor: colors.surfaceSoft,
      borderColor: colors.borderStrong,
      shadowOpacity: 0,
      elevation: 0,
    },
    pressed: {
      opacity: 0.88,
      transform: [{ scale: 0.985 }],
    },
    disabled: {
      opacity: 0.50,
    },
    text: {
      color: colors.background,
      fontSize: 15,
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
}
