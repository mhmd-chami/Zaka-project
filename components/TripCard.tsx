import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TripTemplate } from '@/types';

interface Props {
  template: TripTemplate;
  onPress: () => void;
}

export function TripCard({ template, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: template.color },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.emoji}>{template.emoji}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{template.title}</Text>
        <Text style={styles.description}>{template.description}</Text>
        <Text style={styles.meta}>{template.items.length} items</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 36,
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#134E4A',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
  },
  arrow: {
    fontSize: 20,
    color: '#0D9488',
    marginLeft: 8,
  },
});
