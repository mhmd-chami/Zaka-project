import { AppIcon } from '@/components/AppIcon';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { TransactionRow } from '@/components/TransactionRow';
import { useSettings } from '@/contexts/SettingsContext';
import { getTransactions } from '@/services/walletStorage';
import { Transaction } from '@/types';

export default function HistoryScreen() {
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
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <AppIcon name="history" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
        renderItem={({ item }) => <TransactionRow tx={item} />}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useSettings>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      padding: 20,
      paddingBottom: 40,
    },
    empty: {
      alignItems: 'center',
      paddingTop: 60,
    },
    emptyIcon: {
      marginBottom: 12,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 15,
    },
  });
}
