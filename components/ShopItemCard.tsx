import { AppIcon } from '@/components/AppIcon';
import { BrandMark } from '@/components/BrandMark';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows } from '@/constants/theme';
import { ShopItem } from '@/types';

interface Props {
  item: ShopItem;
  onPress: () => void;
}

export function ShopItemCard({ item, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, shadows.soft, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.markWrap}>
        <BrandMark brand={item.brand} size={52} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.category}>{item.category}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <View style={styles.buyBtn}>
          <AppIcon name="chevron-right" size={17} color="#07110C" strokeWidth={2.5} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.9,
    borderColor: colors.primary,
    transform: [{ translateY: -2 }],
  },
  markWrap: { alignSelf: 'flex-start', borderRadius: 16, overflow: 'hidden' },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    minHeight: 36,
    marginTop: 14,
    lineHeight: 18,
  },
  category: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  buyBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
