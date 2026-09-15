import { AppIcon, type IconName } from '@/components/AppIcon';
import { withoutEmoji } from '@/utils/displayText';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { Transaction } from '@/types';

const icons: Record<Transaction['type'], IconName> = {
  send: 'send',
  send_p2p: 'send',
  send_cash: 'store',
  cash_out: 'banknote',
  receive: 'receive',
  deposit: 'credit-card',
  topup: 'smartphone',
  purchase: 'shop',
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
  const amountLabel = `${isCashPending ? '' : sign}$${tx.amount.toFixed(2)}`;

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: `${stripe}16` }]}>
        <AppIcon name={icons[tx.type]} size={22} color={stripe} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{withoutEmoji(tx.title)}</Text>
        <Text style={styles.sub}>{withoutEmoji(tx.subtitle)}</Text>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            isIncome ? styles.income : isCashPending ? styles.pending : styles.expense,
          ]}
        >
          {amountLabel}
        </Text>
        {isCashPending ? (
          <View style={styles.pendingPill}>
            <Text style={styles.pendingLabel}>Pending</Text>
          </View>
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
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    padding: 15,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  body: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.25,
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
  pendingPill: {
    backgroundColor: 'rgba(245,185,66,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 4,
  },
  pendingLabel: {
    color: colors.pending,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  date: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
});
