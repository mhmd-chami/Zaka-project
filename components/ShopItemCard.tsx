import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
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
      <View style={styles.goldCorner} />
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.category}>{item.category}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <View style={styles.buyBtn}>
          <Text style={styles.buy}>Buy</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    borderColor: colors.borderGold,
  },
  goldCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomLeftRadius: 40,
    backgroundColor: 'rgba(212,175,55,0.12)',
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
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    color: colors.goldLight,
    fontSize: 16,
    fontWeight: '800',
  },
  buyBtn: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldMuted,
  },
  buy: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
