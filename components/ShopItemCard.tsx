import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { ShopItem } from '@/types';

interface Props {
  item: ShopItem;
  onPress: () => void;
}

export function ShopItemCard({ item, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.category}>{item.category}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <Text style={styles.buy}>Buy</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.9,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    minHeight: 36,
  },
  category: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  buy: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
});
