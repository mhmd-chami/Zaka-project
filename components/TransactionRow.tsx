import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { Transaction } from '@/types';

const icons: Record<string, string> = {
  send: '📤',
  send_p2p: '💸',
  send_cash: '🏪',
  receive: '📥',
  topup: '📱',
  purchase: '🛒',
};

interface Props {
  tx: Transaction;
}

export function TransactionRow({ tx }: Props) {
  const isIncome = tx.type === 'receive';
  const isCashPending = tx.type === 'send_cash';
  const sign = isIncome ? '+' : '-';

  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icons[tx.type]}</Text>
      <View style={styles.body}>
        <Text style={styles.title}>{tx.title}</Text>
        <Text style={styles.sub}>{tx.subtitle}</Text>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            isIncome ? styles.income : isCashPending ? styles.pending : styles.expense,
          ]}
        >
          {isCashPending ? '' : sign}${tx.amount.toFixed(2)}
          {isCashPending ? `$${tx.amount.toFixed(2)}` : ''}
        </Text>
        <Text style={styles.date}>
          {new Date(tx.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
  },
  income: {
    color: colors.income,
  },
  expense: {
    color: colors.expense,
  },
  pending: {
    color: colors.warning,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
