import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData, Transaction } from '@/lib/data-context';

const FILTERS = [
  { key: 'all', label: 'সব' },
  { key: 'deposit', label: 'জমা' },
  { key: 'withdrawal', label: 'উত্তোলন' },
  { key: 'share', label: 'শেয়ার' },
  { key: 'loan_repayment', label: 'ঋণ কিস্তি' },
];

function formatAmount(amount: number): string {
  return '৳' + amount.toLocaleString('bn-BD');
}

function TransactionItem({ item }: { item: Transaction }) {
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'জমা',
      withdrawal: 'উত্তোলন',
      share: 'শেয়ার',
      loan_disbursement: 'ঋণ গ্রহণ',
      loan_repayment: 'ঋণ পরিশোধ',
      dividend: 'লভ্যাংশ',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    if (type === 'deposit' || type === 'dividend' || type === 'loan_disbursement') return Colors.success;
    if (type === 'withdrawal' || type === 'loan_repayment') return Colors.error;
    return Colors.info;
  };

  const color = getTypeColor(item.type);
  const isOutgoing = item.type === 'withdrawal' || item.type === 'loan_repayment';

  return (
    <View style={styles.txCard}>
      <View style={[styles.txIcon, { backgroundColor: color + '15' }]}>
        <Ionicons
          name={item.type.includes('loan') ? 'cash' : item.type === 'deposit' ? 'arrow-down' : item.type === 'withdrawal' ? 'arrow-up' : 'layers'}
          size={18}
          color={color}
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txType}>{getTypeLabel(item.type)}</Text>
        <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color }]}>
          {isOutgoing ? '-' : '+'}{formatAmount(item.amount)}
        </Text>
        <Text style={styles.txDate}>{item.date}</Text>
      </View>
    </View>
  );
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, transactions, t } = useData();
  const [filter, setFilter] = useState('all');

  // Move filters inside component to use t()
  const FILTERS = [
    { key: 'all', label: t('all') },
    { key: 'deposit', label: t('deposit') },
    { key: 'withdrawal', label: t('withdrawal') },
    { key: 'share', label: t('share') },
    { key: 'loan_repayment', label: t('loan_repayment') },
  ];

  if (!currentUser) return null;

  const userTx = transactions.filter(t => t.memberId === currentUser.id);
  const filtered = filter === 'all' ? userTx : userTx.filter(t => t.type === filter);

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <Text style={styles.pageTitle}>{t('transactionHistory')}</Text>

      <ScrollableFilters filter={filter} setFilter={setFilter} filters={FILTERS} />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionItem item={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>{t('noTransactionsFound')}</Text>
          </View>
        }
      />
    </View>
  );
}

function ScrollableFilters({ filter, setFilter, filters }: { filter: string; setFilter: (f: string) => void; filters: any[] }) {
  return (
    <View style={styles.filterRow}>
      {filters.map(f => (
        <Pressable
          key={f.key}
          style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          onPress={() => setFilter(f.key)}
        >
          <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansBengali_700Bold',
    color: Colors.text,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_500Medium',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    gap: 12,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: { flex: 1 },
  txType: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
  },
  txDesc: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txRight: { alignItems: 'flex-end' },
  txAmount: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_700Bold',
  },
  txDate: {
    fontSize: 11,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textTertiary,
  },
});
