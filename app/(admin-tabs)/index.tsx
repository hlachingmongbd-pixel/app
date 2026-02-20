import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

function formatAmount(amount: number): string {
  return '৳' + amount.toLocaleString('bn-BD');
}

function StatCard({ icon, label, value, color, bg }: { icon: string; label: string; value: string; color: string; bg: string }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { members, transactions, loanApplications, settings, t } = useData();
  const [refreshing, setRefreshing] = React.useState(false);

  const activeMembers = members.filter(m => m.role !== 'admin');
  const totalShares = activeMembers.reduce((sum, m) => sum + m.shares, 0);
  const totalSavings = activeMembers.reduce((sum, m) => sum + m.savings, 0);
  const totalLoans = activeMembers.reduce((sum, m) => sum + m.loanBalance, 0);
  const pendingLoans = loanApplications.filter(l => l.status === 'pending');

  const todayTx = transactions.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.date === today;
  });

  const recentTx = transactions.slice(0, 5);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const getMemberName = (id: string) => {
    const m = members.find(m => m.id === id);
    return m ? m.name : id;
  };

  const getTypeLabel = (type: string) => {
    return t(type as any) || type;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>{t('dashboard')}</Text>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
          <Text style={styles.adminBadgeText}>{t('admin')}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.statsGrid}>
          <StatCard icon="people" label={t('totalMembers')} value={`${activeMembers.length} ${t('person')}`} color="#3B82F6" bg="#EFF6FF" />
          <StatCard icon="layers" label={t('shareCapital')} value={formatAmount(totalShares * settings.sharePrice)} color="#8B5CF6" bg="#F3E8FF" />
          <StatCard icon="wallet" label={t('totalSavings')} value={formatAmount(totalSavings)} color={Colors.success} bg="#ECFDF5" />
          <StatCard icon="cash" label={t('disbursedLoans')} value={formatAmount(totalLoans)} color={Colors.error} bg="#FEF2F2" />
        </View>

        {pendingLoans.length > 0 && (
          <View style={styles.alertCard}>
            <Ionicons name="alert-circle" size={20} color={Colors.warning} />
            <Text style={styles.alertText}>{pendingLoans.length}{t('pendingLoanApplications')}</Text>
          </View>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('todaysSummary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('todaysTransactions')}</Text>
            <Text style={styles.summaryValue}>{todayTx.length}{t('count')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('activeMembers')}</Text>
            <Text style={styles.summaryValue}>{activeMembers.filter(m => m.isActive).length} {t('person')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('inactiveMembers')}</Text>
            <Text style={styles.summaryValue}>{activeMembers.filter(m => !m.isActive).length} {t('person')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('recentTransactions')}</Text>
        {recentTx.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('noTransactions')}</Text>
          </View>
        ) : (
          recentTx.map(tx => (
            <View key={tx.id} style={styles.txCard}>
              <View style={styles.txInfo}>
                <Text style={styles.txName}>{getMemberName(tx.memberId)}</Text>
                <Text style={styles.txType}>{getTypeLabel(tx.type)} - {tx.description}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txAmount, { color: tx.type === 'withdrawal' || tx.type === 'loan_disbursement' ? Colors.error : Colors.success }]}>
                  {formatAmount(tx.amount)}
                </Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansBengali_700Bold',
    color: Colors.text,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '45%' as any,
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'NotoSansBengali_700Bold',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  alertText: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_500Medium',
    color: '#92400E',
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textTertiary,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  txInfo: { flex: 1 },
  txName: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
  },
  txType: {
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
});
