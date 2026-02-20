import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

function formatAmount(amount: number): string {
  return '৳' + amount.toLocaleString('bn-BD');
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams();
  const { members, transactions, loanApplications, settings, t } = useData();

  const member = members.find(m => m.id === id);
  if (!member) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyText}>{t('noMembersFound')}</Text>
      </View>
    );
  }

  const memberTx = transactions.filter(t => t.memberId === member.id).slice(0, 10);
  const memberLoans = loanApplications.filter(l => l.memberId === member.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={Colors.primary} />
        </View>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.memberId}>{t('memberId')}: {member.id}</Text>
        <View style={[styles.statusBadge, member.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, member.isActive ? styles.activeText : styles.inactiveText]}>
            {member.isActive ? t('active') : t('inactive')}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('info')}</Text>
        <InfoRow label={t('phonePlaceholder')} value={member.phone} />
        <InfoRow label={t('address')} value={member.address} />
        <InfoRow label="NID" value={member.nid || '-'} />
        <InfoRow label={t('applicationDate')} value={member.joinDate} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('financeInfo')}</Text>
        <InfoRow label={t('shareCount')} value={`${member.shares} ${t('piece')}`} />
        <InfoRow label={t('totalShareValue')} value={formatAmount(member.shares * settings.sharePrice)} />
        <InfoRow label={t('savings')} value={formatAmount(member.savings)} />
        <InfoRow label={t('loans')} value={formatAmount(member.loanBalance)} />
        <InfoRow label={t('dividend')} value={formatAmount(member.dividend)} />
      </View>

      {memberLoans.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('loans')}</Text>
          {memberLoans.map(l => (
            <View key={l.id} style={styles.loanItem}>
              <InfoRow label={t('purpose')} value={l.purpose} />
              <InfoRow label={t('amount')} value={formatAmount(l.amount)} />
              <InfoRow label={t('processing')} value={t(l.status as any)} />
              {l !== memberLoans[memberLoans.length - 1] && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}

      {memberTx.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('recentTransactions')}</Text>
          {memberTx.map(tx => {
            return (
              <View key={tx.id} style={styles.txRow}>
                <Text style={styles.txType}>{t(tx.type as any)}</Text>
                <Text style={styles.txAmount}>{formatAmount(tx.amount)}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textTertiary },
  profileSection: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 20, fontFamily: 'NotoSansBengali_700Bold', color: Colors.text },
  memberId: { fontSize: 13, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary, marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  activeBadge: { backgroundColor: '#ECFDF5' },
  inactiveBadge: { backgroundColor: '#FEF2F2' },
  statusText: { fontSize: 12, fontFamily: 'NotoSansBengali_600SemiBold' },
  activeText: { color: Colors.success },
  inactiveText: { color: Colors.error },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text, marginBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6,
  },
  infoLabel: { fontSize: 14, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary },
  infoValue: { fontSize: 14, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text, maxWidth: '60%' as any, textAlign: 'right' as const },
  loanItem: { marginBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 8 },
  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  txType: { fontSize: 13, fontFamily: 'NotoSansBengali_500Medium', color: Colors.text, flex: 1 },
  txAmount: { fontSize: 13, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.primary },
  txDate: { fontSize: 11, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textTertiary, marginLeft: 8 },
});
