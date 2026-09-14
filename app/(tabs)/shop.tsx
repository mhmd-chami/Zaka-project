import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ShopItemCard } from '@/components/ShopItemCard';
import { colors } from '@/constants/theme';
import { shopItems } from '@/data/shopItems';
import { getProfile, purchaseItem } from '@/services/walletStorage';

export default function ShopScreen() {
  const router = useRouter();

  async function buy(name: string, price: number) {
    const profile = await getProfile();

    Alert.alert('Confirm purchase', `Buy ${name} for $${price.toFixed(2)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Buy now',
        onPress: async () => {
          const result = await purchaseItem(name, price);
          if (!result.ok) {
            Alert.alert('Purchase failed', result.error);
            return;
          }
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          Alert.alert(
            'Success! 🎉',
            `${name} purchased.\nNew balance: $${(profile.balance - price).toFixed(2)}`
          );
          router.push('/(tabs)/history');
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Buy subscriptions, gift cards, and more with your balance.
      </Text>

      <View style={styles.grid}>
        {shopItems.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            onPress={() => buy(item.name, item.price)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
