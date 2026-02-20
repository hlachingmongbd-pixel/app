import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

function formatAmount(amount: number): string {
  return '৳' + amount.toLocaleString('bn-BD');
}

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, loanApplications, settings, t } = useData();

  if (!currentUser) return null;

  const userLoans = loanApplications.filter(l => l.memberId === currentUser.id);
  const activeLoans = userLoans.filter(l => l.status === 'approved');
  const pendingLoans = userLoans.filter(l => l.status === 'pending');

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <Text style={styles.pageTitle}>{t('financeInfo')}</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="layers" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.cardTitle}>{t('shareInfo')}</Text>
          </View>
          <View style={styles.cardBody}>
            <InfoRow label={t('shareCount')} value={`${currentUser.shares} ${t('piece')}`} />
            <InfoRow label={t('sharePrice')} value={formatAmount(settings.sharePrice)} />
            <InfoRow label={t('totalShareValue')} value={formatAmount(currentUser.shares * settings.sharePrice)} color="#3B82F6" />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="wallet" size={20} color={Colors.success} />
            </View>
            <Text style={styles.cardTitle}>{t('savingsDetails')}</Text>
          </View>
          <View style={styles.cardBody}>
            <InfoRow label={t('totalSavings')} value={formatAmount(currentUser.savings)} color={Colors.success} />
            <InfoRow label={t('interestRate')} value={`${settings.interestRate}%`} />
            <InfoRow label={t('annualInterest')} value={formatAmount(Math.round(currentUser.savings * settings.interestRate / 100))} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="trending-down" size={20} color={Colors.error} />
            </View>
            <Text style={styles.cardTitle}>{t('activeLoans')}</Text>
          </View>
          <View style={styles.cardBody}>
            {activeLoans.length === 0 ? (
              <Text style={styles.noData}>{t('noActiveLoans')}</Text>
            ) : (
              activeLoans.map(loan => (
                <View key={loan.id} style={styles.loanItem}>
                  <InfoRow label={t('loanPurpose')} value={loan.purpose} />
                  <InfoRow label={t('loanAmount')} value={formatAmount(loan.amount)} color={Colors.error} />
                  <InfoRow label={t('duration')} value={`${loan.duration} ${t('month')}`} />
                  <InfoRow label={t('monthlyInstallment')} value={formatAmount(loan.monthlyInstallment || 0)} />
                  <InfoRow label={t('approvalDate')} value={loan.approvedDate || '-'} />
                  {loan !== activeLoans[activeLoans.length - 1] && <View style={styles.divider} />}
                </View>
              ))
            )}
          </View>
        </View>

        {pendingLoans.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time" size={20} color={Colors.warning} />
              </View>
              <Text style={styles.cardTitle}>{t('pendingApplications')}</Text>
            </View>
            <View style={styles.cardBody}>
              {pendingLoans.map(loan => (
                <View key={loan.id} style={styles.loanItem}>
                  <InfoRow label={t('purpose')} value={loan.purpose} />
                  <InfoRow label={t('amount')} value={formatAmount(loan.amount)} />
                  <InfoRow label={t('applicationDate')} value={loan.appliedDate} />
                  <View style={styles.statusBadge}>
                    <Ionicons name="hourglass" size={14} color={Colors.warning} />
                    <Text style={styles.statusText}>{t('processing')}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="gift" size={20} color={Colors.accent} />
            </View>
            <Text style={styles.cardTitle}>{t('dividendInfo')}</Text>
          </View>
          <View style={styles.cardBody}>
            <InfoRow label={t('lastDividend')} value={formatAmount(currentUser.dividend)} color={Colors.accent} />
            <InfoRow label={t('dividendRate')} value={`${settings.interestRate}%`} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansBengali_700Bold',
    color: Colors.text,
    paddingVertical: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
  },
  cardBody: { padding: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_600SemiBold',
    color: Colors.text,
  },
  noData: {
    fontSize: 14,
    fontFamily: 'NotoSansBengali_400Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  loanItem: { marginBottom: 4 },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'NotoSansBengali_500Medium',
    color: Colors.warning,
  },
});
