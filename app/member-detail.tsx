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
  const { members, transactions, loanApplications, settings } = useData();

  const member = members.find(m => m.id === id);
  if (!member) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyText}>সদস্য পাওয়া যায়নি</Text>
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
        <Text style={styles.memberId}>ID: {member.id}</Text>
        <View style={[styles.statusBadge, member.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, member.isActive ? styles.activeText : styles.inactiveText]}>
            {member.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ব্যক্তিগত তথ্য</Text>
        <InfoRow label="ফোন" value={member.phone} />
        <InfoRow label="ঠিকানা" value={member.address} />
        <InfoRow label="NID" value={member.nid || '-'} />
        <InfoRow label="যোগদানের তারিখ" value={member.joinDate} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>আর্থিক তথ্য</Text>
        <InfoRow label="শেয়ার সংখ্যা" value={`${member.shares} টি`} />
        <InfoRow label="শেয়ার মূল্য" value={formatAmount(member.shares * settings.sharePrice)} />
        <InfoRow label="সঞ্চয়" value={formatAmount(member.savings)} />
        <InfoRow label="ঋণ" value={formatAmount(member.loanBalance)} />
        <InfoRow label="লভ্যাংশ" value={formatAmount(member.dividend)} />
      </View>

      {memberLoans.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ঋণের তথ্য</Text>
          {memberLoans.map(l => (
            <View key={l.id} style={styles.loanItem}>
              <InfoRow label="উদ্দেশ্য" value={l.purpose} />
              <InfoRow label="পরিমাণ" value={formatAmount(l.amount)} />
              <InfoRow label="অবস্থা" value={l.status === 'approved' ? 'অনুমোদিত' : l.status === 'pending' ? 'অপেক্ষমাণ' : 'প্রত্যাখ্যাত'} />
              {l !== memberLoans[memberLoans.length - 1] && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}

      {memberTx.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>সাম্প্রতিক লেনদেন</Text>
          {memberTx.map(tx => {
            const labels: Record<string, string> = { deposit: 'জমা', withdrawal: 'উত্তোলন', share: 'শেয়ার', loan_disbursement: 'ঋণ', loan_repayment: 'কিস্তি', dividend: 'লভ্যাংশ' };
            return (
              <View key={tx.id} style={styles.txRow}>
                <Text style={styles.txType}>{labels[tx.type] || tx.type}</Text>
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
