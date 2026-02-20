import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

function formatAmount(amount: number): string {
  return '৳' + amount.toLocaleString('bn-BD');
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon as any} size={18} color={Colors.textSecondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { currentUser, settings } = useData();

  if (!currentUser) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.memberId}>সদস্য আইডি: {currentUser.id}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{currentUser.role === 'admin' ? 'প্রশাসক' : 'সদস্য'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ব্যক্তিগত তথ্য</Text>
        <InfoRow icon="call" label="ফোন" value={currentUser.phone} />
        <InfoRow icon="location" label="ঠিকানা" value={currentUser.address} />
        <InfoRow icon="card" label="NID" value={currentUser.nid || 'দেওয়া হয়নি'} />
        <InfoRow icon="calendar" label="যোগদান" value={currentUser.joinDate} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>আর্থিক সারসংক্ষেপ</Text>
        <View style={styles.financeGrid}>
          <View style={[styles.financeItem, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.financeLabel}>শেয়ার</Text>
            <Text style={[styles.financeValue, { color: '#3B82F6' }]}>{formatAmount(currentUser.shares * settings.sharePrice)}</Text>
          </View>
          <View style={[styles.financeItem, { backgroundColor: '#ECFDF5' }]}>
            <Text style={styles.financeLabel}>সঞ্চয়</Text>
            <Text style={[styles.financeValue, { color: Colors.success }]}>{formatAmount(currentUser.savings)}</Text>
          </View>
          <View style={[styles.financeItem, { backgroundColor: '#FEF2F2' }]}>
            <Text style={styles.financeLabel}>ঋণ</Text>
            <Text style={[styles.financeValue, { color: Colors.error }]}>{formatAmount(currentUser.loanBalance)}</Text>
          </View>
          <View style={[styles.financeItem, { backgroundColor: '#FFFBEB' }]}>
            <Text style={styles.financeLabel}>লভ্যাংশ</Text>
            <Text style={[styles.financeValue, { color: Colors.accent }]}>{formatAmount(currentUser.dividend)}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontFamily: 'NotoSansBengali_700Bold', color: Colors.text },
  memberId: { fontSize: 13, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary, marginTop: 4 },
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8, marginTop: 8,
  },
  roleText: { fontSize: 12, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.primary },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text, marginBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 14, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary },
  infoValue: { fontSize: 14, fontFamily: 'NotoSansBengali_600SemiBold', color: Colors.text, maxWidth: '55%' as any, textAlign: 'right' as const },
  financeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  financeItem: {
    flexBasis: '47%' as any, flexGrow: 1,
    padding: 14, borderRadius: 14, alignItems: 'center', gap: 4,
  },
  financeLabel: { fontSize: 12, fontFamily: 'NotoSansBengali_400Regular', color: Colors.textSecondary },
  financeValue: { fontSize: 16, fontFamily: 'NotoSansBengali_700Bold' },
});
