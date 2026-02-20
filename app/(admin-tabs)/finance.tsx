import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import * as Haptics from 'expo-haptics';

function formatAmount(amount: number): string {
  return '৳' + amount.toLocaleString('bn-BD');
}

export default function AdminFinanceScreen() {
  const insets = useSafeAreaInsets();
  const { loanApplications, approveLoan, rejectLoan, transactions, members, t } = useData();

  const pendingLoans = loanApplications.filter(l => l.status === 'pending');
  const approvedLoans = loanApplications.filter(l => l.status === 'approved');
  const recentTx = transactions.slice(0, 10);

  const getMemberName = (id: string) => {
    const m = members.find(m => m.id === id);
    return m ? m.name : id;
  };

  const handleApprove = (id: string, memberId: string) => {
    const name = getMemberName(memberId);
    Alert.alert(t('loanApproval'), `${name} ${t('approveConfirm')}`, [
      { text: t('no'), style: 'cancel' },
      {
        text: t('approve'),
        onPress: async () => {
          await approveLoan(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleReject = (id: string, memberId: string) => {
    const name = getMemberName(memberId);
    Alert.alert(t('loanRejection'), `${name} ${t('rejectConfirm')}`, [
      { text: t('no'), style: 'cancel' },
      {
        text: t('reject'),
        style: 'destructive',
        onPress: async () => {
          await rejectLoan(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  const getLabel = (type: string) => {
    return t(type as any) || type;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>{t('financialManagement')}</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/add-transaction')}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.actionGrid}>
          <Pressable style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.7 }]} onPress={() => router.push('/add-transaction')}>
            <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="add-circle" size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionLabel}>{t('transactionEntry')}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.7 }]} onPress={() => router.push('/admin-settings')}>
            <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="settings" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.actionLabel}>{t('settings')}</Text>
          </Pressable>
        </View>

        {pendingLoans.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('pendingLoanApplications')} ({pendingLoans.length})</Text>
            {pendingLoans.map(loan => (
              <View key={loan.id} style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <Text style={styles.loanName}>{getMemberName(loan.memberId)}</Text>
                  <Text style={styles.loanAmount}>{formatAmount(loan.amount)}</Text>
                </View>
                <Text style={styles.loanPurpose}>{loan.purpose}</Text>
                <Text style={styles.loanMeta}>{t('duration')}: {loan.duration} {t('month')} | {t('applicationDate')}: {loan.appliedDate}</Text>
                <View style={styles.loanActions}>
                  <Pressable
                    style={({ pressed }) => [styles.approveBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => handleApprove(loan.id, loan.memberId)}
                  >
                    <Ionicons name="checkmark" size={18} color={Colors.white} />
                    <Text style={styles.approveBtnText}>{t('approve')}</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.rejectBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => handleReject(loan.id, loan.memberId)}
                  >
                    <Ionicons name="close" size={18} color={Colors.error} />
                    <Text style={styles.rejectBtnText}>{t('reject')}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>{t('approvedLoans')} ({approvedLoans.length})</Text>
        {approvedLoans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('noApprovedLoans')}</Text>
          </View>
        ) : (
          approvedLoans.map(loan => (
            <View key={loan.id} style={styles.approvedCard}>
              <View style={styles.loanHeader}>
                <Text style={styles.loanName}>{getMemberName(loan.memberId)}</Text>
                <Text style={[styles.loanAmount, { color: Colors.success }]}>{formatAmount(loan.amount)}</Text>
              </View>
              <Text style={styles.loanPurpose}>{loan.purpose}</Text>
              <Text style={styles.loanMeta}>
                {t('installment')}: {formatAmount(loan.monthlyInstallment || 0)}/{t('month')} | {t('approvalDate')}: {loan.approvedDate}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>{t('recentTransactions')}</Text>
        {recentTx.map(tx => {
          return (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txInfo}>
                <Text style={styles.txName}>{getMemberName(tx.memberId)}</Text>
                <Text style={styles.txType}>{getLabel(tx.type)}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'withdrawal' || tx.type === 'loan_disbursement' ? Colors.error : Colors.success }]}>
                {formatAmount(tx.amount)}
              </Text>
            </View>
          );
        })}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_500Medium',
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 4,
  },
  loanCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  loanName: {
    fontSize: 15,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
  },
  loanAmount: {
    fontSize: 15,
    fontFamily: 'NotoSansBengali_700Bold',
    color: Colors.text,
  },
  loanPurpose: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  loanMeta: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textTertiary,
    marginBottom: 10,
  },
  loanActions: {
    flexDirection: 'row',
    gap: 10,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  approveBtnText: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.white,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rejectBtnText: {
    fontSize: 13,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.error,
  },
  approvedCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
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
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  txInfo: { flex: 1 },
  txName: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_500Medium',
    color: Colors.text,
  },
  txType: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
  },
  txAmount: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_700Bold',
  },
});
