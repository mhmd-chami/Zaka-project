import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/theme';
import { DestinationPreset } from '@/types';

interface Props {
  preset: DestinationPreset;
  selected: boolean;
  onPress: () => void;
}

export function DestinationCard({ preset, selected, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.emoji}>{preset.emoji}</Text>
      <Text style={[styles.name, selected && styles.nameSelected]}>
        {preset.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  emoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  nameSelected: {
    color: colors.text,
  },
});
