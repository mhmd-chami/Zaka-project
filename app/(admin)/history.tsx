import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { TransactionRow } from '@/components/TransactionRow';
import { useSettings } from '@/contexts/SettingsContext';
import { getTransactions } from '@/services/walletStorage';
import { Transaction } from '@/types';

export default function AdminHistoryScreen() {
  const { colors } = useSettings();
  const styles = makeStyles(colors);
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

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: 20, paddingBottom: 40 },
    empty: {
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 40,
    },
  });
}
