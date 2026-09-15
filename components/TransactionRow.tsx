import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { Transaction } from '@/types';

const icons: Record<string, string> = {
  send: '📤',
  send_p2p: '💸',
  send_cash: '🏪',
  cash_out: '💵',
  receive: '📥',
  deposit: '💳',
  topup: '📱',
  purchase: '🛒',
};

const stripeColors: Record<string, string> = {
  send: colors.expense,
  send_p2p: colors.expense,
  send_cash: colors.pending,
  cash_out: colors.expense,
  receive: colors.income,
  deposit: colors.income,
  topup: colors.accent,
  purchase: colors.gold,
};

interface Props {
  tx: Transaction;
}

export function TransactionRow({ tx }: Props) {
  const isIncome = tx.type === 'receive' || tx.type === 'deposit';
  const isCashPending =
    (tx.type === 'send_cash' || tx.type === 'cash_out') &&
    tx.status === 'pending';
  const sign = isIncome ? '+' : '-';
  const stripe = stripeColors[tx.type] ?? colors.border;

  return (
    <View style={styles.row}>
      <View style={[styles.stripe, { backgroundColor: stripe }]} />
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
        {isCashPending ? (
          <Text style={styles.pendingLabel}>Pending</Text>
        ) : null}
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
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  icon: {
    fontSize: 22,
    marginRight: 12,
    marginLeft: 4,
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
    fontSize: 11,
    marginTop: 3,
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
    color: colors.pending,
  },
  pendingLabel: {
    color: colors.pending,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  date: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
