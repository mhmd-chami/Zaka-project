import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  emoji: string;
  label: string;
  onPress: () => void;
}

export function ActionButton({ emoji, label, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
