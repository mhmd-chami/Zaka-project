import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { TransactionRow } from '@/components/TransactionRow';
import { colors } from '@/constants/theme';
import { getTransactions } from '@/services/walletStorage';
import { Transaction } from '@/types';

export default function AdminHistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      getTransactions().then(setTransactions);
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No location transactions yet</Text>
        }
        renderItem={({ item }) => <TransactionRow tx={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 20, paddingBottom: 40 },
  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
